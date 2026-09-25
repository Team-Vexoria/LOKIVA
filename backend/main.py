import os
import shutil
import tempfile
import logging
from typing import Optional
from fastapi import FastAPI, UploadFile, File, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
try:
    from faster_whisper import WhisperModel
except ImportError:
    WhisperModel = None
from backend.app.core.config import settings
from backend.app.core.database import Base, engine
from backend.app.api import auth, experiences, recommendations, ai, itineraries, providers, admin, reviews, destinations, voice_solver

# Create all database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="LOKIVA API",
    description="Intelligent Local Discovery & Experience Platform Backend",
    version="1.0.0"
)

# CORS middleware for local frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://localhost:4000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers under prefix
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(destinations.router, prefix=settings.API_V1_STR)
app.include_router(experiences.router, prefix=settings.API_V1_STR)
app.include_router(recommendations.router, prefix=settings.API_V1_STR)
app.include_router(ai.router, prefix=settings.API_V1_STR)
app.include_router(itineraries.router, prefix=settings.API_V1_STR)
app.include_router(providers.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(reviews.router, prefix=settings.API_V1_STR)
app.include_router(voice_solver.router)

@app.get("/")
def root():
    return {
        "app": "LOKIVA API",
        "tagline": "Find the place. Feel the local.",
        "status": "healthy",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "ok", "destination": settings.DEFAULT_CITY}

_whisper_model = None

def get_whisper_model():
    global _whisper_model
    if WhisperModel is None:
        return None
    if _whisper_model is None:
        try:
            _whisper_model = WhisperModel("small", device="cpu", compute_type="int8")
        except Exception as err:
            logging.warning("Falling back to base model: %s", err)
            _whisper_model = WhisperModel("base", device="cpu", compute_type="int8")
    return _whisper_model

HALLUCINATION_PATTERNS = {
    "thank you for watching",
    "thank you for watching and have a nice day",
    "thanks for watching",
    "thank you",
    "thank you very much",
    "have a nice day",
    "bye",
    "please subscribe",
    "subscribe to my channel",
    "subtitles by",
    "you",
    ".",
}

@app.post("/stt")
async def stt(file: UploadFile = File(...), task: str = Query("translate")):
    orig_ext = os.path.splitext(file.filename or "")[1].lower() or ".webm"
    if orig_ext not in [".webm", ".wav", ".mp3", ".ogg", ".m4a", ".mp4"]:
        orig_ext = ".webm"
        
    with tempfile.NamedTemporaryFile(delete=False, suffix=orig_ext) as tmp:
        tmp_path = tmp.name
        shutil.copyfileobj(file.file, tmp)

    file_size = os.path.getsize(tmp_path)
    print(f"[STT Request] Received file: ext={orig_ext}, size={file_size} bytes")

    # 1. Optional Groq Cloud Whisper Large v3 if GROQ_API_KEY is configured
    groq_api_key = os.environ.get("GROQ_API_KEY")
    if groq_api_key and groq_api_key.strip():
        try:
            import urllib.request
            import json
            print("[STT] Attempting Groq Cloud Whisper Large v3 translation...")
            boundary = "----WhisperBoundary7MA4YWxkTrZu0gW"
            body = []
            body.append(f"--{boundary}".encode())
            body.append(b'Content-Disposition: form-data; name="model"')
            body.append(b"")
            body.append(b"whisper-large-v3")
            
            body.append(f"--{boundary}".encode())
            body.append(f'Content-Disposition: form-data; name="file"; filename="audio{orig_ext}"'.encode())
            body.append(f"Content-Type: audio/{orig_ext.replace('.', '')}".encode())
            body.append(b"")
            with open(tmp_path, "rb") as f:
                body.append(f.read())
                
            body.append(f"--{boundary}--".encode())
            body.append(b"")
            payload = b"\r\n".join(body)

            req = urllib.request.Request(
                "https://api.groq.com/openai/v1/audio/translations",
                data=payload,
                headers={
                    "Authorization": f"Bearer {groq_api_key.strip()}",
                    "Content-Type": f"multipart/form-data; boundary={boundary}"
                }
            )
            with urllib.request.urlopen(req, timeout=12) as response:
                res_data = json.loads(response.read().decode())
                groq_text = (res_data.get("text") or "").strip()
                if groq_text:
                    print(f"[STT Result - Groq Cloud] Text='{groq_text}'")
                    return {"text": groq_text, "language": "en", "task": task, "provider": "groq-whisper-large-v3"}
        except Exception as groq_err:
            print(f"[STT] Groq notice, falling back to local faster-whisper: {groq_err}")

    # 2. Local faster-whisper model
    model = get_whisper_model()
    if model is None:
        raise HTTPException(
            status_code=503,
            detail="Speech-to-Text model not loaded. Please set GROQ_API_KEY or install faster-whisper."
        )
    try:
        segments, info = model.transcribe(
            tmp_path,
            task=task,
            vad_filter=True,
            vad_parameters=dict(min_silence_duration_ms=400),
            beam_size=5,
            no_speech_threshold=0.6,
            condition_on_previous_text=False
        )
        
        extracted_text = " ".join(s.text.strip() for s in segments if s.text).strip()
        duration = getattr(info, "duration", 0)
        print(f"[STT Result - Local Whisper] Lang={info.language}, Duration={duration:.2f}s, Text='{extracted_text}'")
        
        # Suppress hallucinations on silence or background noise
        normalized = extracted_text.lower().strip(" .!?,-\"'")
        if normalized in HALLUCINATION_PATTERNS or len(normalized) < 2:
            extracted_text = ""
            
        return {
            "text": extracted_text,
            "language": info.language if info else "en",
            "task": task,
            "provider": "faster-whisper-local"
        }
    except Exception as exc:
        logging.error("STT transcription error: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))
    finally:
        if os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except Exception:
                pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
