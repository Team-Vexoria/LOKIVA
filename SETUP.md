# LOKIVA — Setup

Everything you need to get the full stack (web + solver-api + realtime-api) running locally, plus deployment notes for demo day.

---

## 1. Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | 20.x LTS | Frontend + realtime-api |
| npm | 10.x | Repo uses npm workspaces |
| Python | 3.11+ | solver-api |
| pip / venv | — | Isolate solver-api's dependencies |
| Firebase CLI | latest | `npm install -g firebase-tools` |
| Git | any recent | — |

Check versions before starting:
```bash
node -v && npm -v && python3 --version
```

---

## 2. Clone and install

```bash
git clone <repo-url> lokiva
cd lokiva

# Frontend + realtime-api (npm workspaces)
npm install --workspaces

# solver-api — isolated Python environment
cd services/solver-api
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cd ../..
```

---

## 3. Environment variables

Copy the example file and fill it in — nothing runs without these.

```bash
cp .env.example .env
```

```ini
# .env

# Firebase (web + realtime-api)
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=

# Maps / Directions — used for real travel time, not straight-line distance
MAPS_API_KEY=

# LLM provider — free-text parsing, listing generation, explanation fallback
LLM_API_KEY=
LLM_MODEL=                        # e.g. the model string for whichever provider you're using

# solver-api
SOLVER_API_PORT=8000
SOLVER_API_URL=http://localhost:8000

# realtime-api
REALTIME_API_PORT=4000
REALTIME_API_URL=http://localhost:4000

# Frontend (Vite — must be prefixed VITE_ to be exposed to the client)
VITE_SOLVER_API_URL=http://localhost:8000
VITE_REALTIME_API_URL=http://localhost:4000
```

Get the Firebase values from **Project Settings → General → Your apps** in the Firebase console. Get a Maps API key from Google Cloud Console with the Directions API and Places API enabled — both are used, not just one.

Never commit `.env`. It's already in `.gitignore`; double-check before your first commit if you cloned before that was set up.

---

## 4. Seed data

The solver is useless against an empty catalogue. Seed 30–50 realistic sample experiences before doing any solver work:

```bash
cd services/solver-api
source .venv/bin/activate
python scripts/seed_experiences.py
```

This populates Firestore with India-relevant sample listings across categories (food, culture, adventure, family) with full fields — price, duration, hours, accessibility tags — so the packer has something real to work against from day one. Don't build UI against mock JSON in the frontend once this exists; point everything at the real seeded data.

---

## 5. Running locally

From the repo root, one command starts everything:

```bash
npm run dev
```

This runs, concurrently:
- `apps/web` on `http://localhost:5173` (Vite default)
- `services/solver-api` on `http://localhost:8000` (FastAPI, via `uvicorn --reload`)
- `services/realtime-api` on `http://localhost:4000` (Express + Socket.io)

To run a single service in isolation (useful when you're only working on the solver):
```bash
npm run dev --workspace=apps/web
# or, for solver-api specifically:
cd services/solver-api && source .venv/bin/activate && uvicorn main:app --reload --port 8000
```

**Quick health check** once everything's up:
```bash
curl http://localhost:8000/health      # solver-api
curl http://localhost:4000/health      # realtime-api
```
Both should return `{"status": "ok"}`. If either doesn't, check the env vars for that service first — most local failures trace back to a missing key, not a code issue.

---

## 6. Common issues

| Symptom | Likely cause |
|---|---|
| Frontend loads but map is blank | `VITE_MAPS_API_KEY` missing or Places/Directions API not enabled on that key in Google Cloud Console |
| Solver returns `infeasible` for every request | Seed script wasn't run, or ran against the wrong Firestore project — check `FIREBASE_PROJECT_ID` matches the console |
| Re-plan doesn't trigger in the UI | `realtime-api` socket connection failing — check `VITE_REALTIME_API_URL` matches the port `realtime-api` actually started on |
| `pip install` fails on solver-api | Python version below 3.11 — some solver dependencies need the newer typing features |
| Provider AI co-pilot returns empty listings | `LLM_API_KEY` invalid or rate-limited — check the provider's dashboard, not just the key format |

---

## 7. Deployment (demo day)

**Frontend (`apps/web`)** → Vercel. Connect the repo, set the root directory to `apps/web`, add the `VITE_*` env vars in the Vercel project settings (not committed anywhere). One-command deploy on push to `main`.

**solver-api** → Render or Railway. Point at `services/solver-api`, set the start command to `uvicorn main:app --host 0.0.0.0 --port $PORT`, add the non-`VITE_` env vars from §3.

**realtime-api** → same platform as solver-api for simplicity. Start command: `node index.js` (or `npm start` from that workspace). Make sure the deployed `VITE_REALTIME_API_URL` in the frontend's Vercel env points at this service's live URL, not `localhost`.

**Before you walk into the room:** run the full demo scenario (Sharma family — 2 hrs, ₹1,500, Bandra, wheelchair access, "it just started raining") against the *deployed* URLs, not localhost. A backend that works locally and silently fails on Render because of a missing prod env var is the single most common last-minute failure — check this the night before, not five minutes before your slot.

**Backup.** Per the pre-submission checklist in `architecture.md`, have a screen recording of the full demo ready regardless of how confident you are in the live deploy.