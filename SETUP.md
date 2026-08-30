# LOKIVA — Local Setup & Development Guide

## Prerequisites
- Python 3.10+
- Node.js 18+ and npm

---

## 1. Backend Setup

```bash
cd backend
python -m pip install -r requirements.txt

# Seed 100+ Jaipur experiences and demo accounts
python seed/seed_data.py

# Run unit tests
python -m pytest tests/test_engines.py

# Start FastAPI server on port 8000
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000`.

---

## 3. Demo Credentials

| Role | Email | Password | Persona Context |
|------|-------|----------|-----------------|
| **Traveler** | `aarav@lokiva.com` | `traveler123` | Family · 4 pax · ₹2,000 · Low walking |
| **Provider** | `provider@lokiva.com` | `provider123` | Jaipur Artisan Guild · Verified host |
| **Admin** | `admin@lokiva.com` | `admin123` | Superuser · Platform Command Center |

*(Use the 1-click Demo Persona dropdown on the top navbar or login page for instant access)*
