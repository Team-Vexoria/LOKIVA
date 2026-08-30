# LOKIVA — API Documentation

Base URL: `http://localhost:8000/api/v1`

## 1. Authentication
- `POST /auth/register` — Register a new user (traveler/provider)
- `POST /auth/login` — Login and receive JWT bearer token
- `GET /auth/me` — Retrieve current authenticated user profile
- `POST /auth/demo-login/{role}` — 1-Click login as `traveler`, `provider`, or `admin`

## 2. Experiences
- `GET /experiences` — Query catalog with filters (`category`, `max_price`, `low_walking`, `wheelchair`, `is_hidden_gem`, `is_indoor`)
- `GET /experiences/{id}` — Full experience details with provider profile and reviews
- `GET /experiences/categories` — Aggregated category metrics with icons and taglines
- `POST /experiences` — Create a new experience listing (Provider only)

## 3. AI & Recommendations
- `POST /ai/intent` — Natural language constraint extraction to JSON
- `POST /ai/chat` — AI Local Concierge conversation with grounded DB recommendations
- `POST /recommendations` — Scored recommendations with "Why this fits you" bullets

## 4. Itineraries & Feasibility
- `POST /itineraries` — Create and sequence a day plan with computed transit durations
- `GET /itineraries/{id}` — Fetch full itinerary with timeline items
- `GET /itineraries/user/me` — Fetch logged-in user's itineraries
- `POST /itineraries/feasibility-check` — Real-time feasibility calculation
- `POST /itineraries/replan` — Dynamic re-planning (`weather_rain`, `activity_unavailable`, `reduced_time`, `reduced_budget`)

## 5. Reviews & Favorites
- `POST /reviews` — Submit a rating and review
- `GET /reviews/{experience_id}` — Fetch reviews for an experience
- `POST /favorites/{experience_id}` — Toggle bookmarking an experience
- `GET /favorites` — Fetch user's saved bookmarks

## 6. Provider Hub
- `GET /providers/me` — Provider profile
- `GET /providers/analytics` — 7-day views trend, saves, bookings, conversion, revenue
- `GET /providers/experiences` — Provider's managed listings

## 7. Admin Command Center
- `GET /admin/stats` — Platform health, GMV, total users and categories
- `GET /admin/providers` — List of all providers with verification status
- `POST /admin/providers/{id}/verify` — Approve or revoke provider verification
- `POST /admin/experiences/{id}/moderate` — Disable or approve listing
