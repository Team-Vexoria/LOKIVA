import re
import json
import logging
from typing import Dict, Any, List, Optional
import httpx
from backend.app.core.config import settings
from backend.app.schemas import StructuredIntent

logger = logging.getLogger(__name__)

# Known Indian Cities and destinations dictionary
INDIAN_DESTINATIONS = {
    "mumbai": {"city": "Mumbai", "state": "Maharashtra", "lat": 19.0760, "lng": 72.8777},
    "delhi": {"city": "Delhi", "state": "Delhi", "lat": 28.6139, "lng": 77.2090},
    "new delhi": {"city": "Delhi", "state": "Delhi", "lat": 28.6139, "lng": 77.2090},
    "jaipur": {"city": "Jaipur", "state": "Rajasthan", "lat": 26.9124, "lng": 75.7873},
    "goa": {"city": "Goa", "state": "Goa", "lat": 15.2993, "lng": 74.1240},
    "panaji": {"city": "Goa", "state": "Goa", "lat": 15.4909, "lng": 73.8278},
    "kochi": {"city": "Kochi", "state": "Kerala", "lat": 9.9312, "lng": 76.2673},
    "cochin": {"city": "Kochi", "state": "Kerala", "lat": 9.9312, "lng": 76.2673},
    "bengaluru": {"city": "Bengaluru", "state": "Karnataka", "lat": 12.9716, "lng": 77.5946},
    "bangalore": {"city": "Bengaluru", "state": "Karnataka", "lat": 12.9716, "lng": 77.5946},
    "kolkata": {"city": "Kolkata", "state": "West Bengal", "lat": 22.5726, "lng": 88.3639},
    "calcutta": {"city": "Kolkata", "state": "West Bengal", "lat": 22.5726, "lng": 88.3639},
    "varanasi": {"city": "Varanasi", "state": "Uttar Pradesh", "lat": 25.3176, "lng": 82.9739},
    "banaras": {"city": "Varanasi", "state": "Uttar Pradesh", "lat": 25.3176, "lng": 82.9739},
    "kashi": {"city": "Varanasi", "state": "Uttar Pradesh", "lat": 25.3176, "lng": 82.9739},
    "rishikesh": {"city": "Rishikesh", "state": "Uttarakhand", "lat": 30.0869, "lng": 78.2676},
    "udaipur": {"city": "Udaipur", "state": "Rajasthan", "lat": 24.5854, "lng": 73.7125},
    "hyderabad": {"city": "Hyderabad", "state": "Telangana", "lat": 17.3850, "lng": 78.4867},
    "chennai": {"city": "Chennai", "state": "Tamil Nadu", "lat": 13.0827, "lng": 80.2707},
    "pune": {"city": "Pune", "state": "Maharashtra", "lat": 18.5204, "lng": 73.8567},
    "amritsar": {"city": "Amritsar", "state": "Punjab", "lat": 31.6340, "lng": 74.8723},
    "lucknow": {"city": "Lucknow", "state": "Uttar Pradesh", "lat": 26.8467, "lng": 80.9462},
    "shillong": {"city": "Shillong", "state": "Meghalaya", "lat": 25.5788, "lng": 91.8933},
    "darjeeling": {"city": "Darjeeling", "state": "West Bengal", "lat": 27.0410, "lng": 88.2663},
    "ahmedabad": {"city": "Ahmedabad", "state": "Gujarat", "lat": 23.0225, "lng": 72.5714}
}

def extract_intent_fallback(query: str, user_location: Optional[Dict[str, float]] = None, current_city: Optional[str] = None) -> StructuredIntent:
    """
    High-precision Pan-India local NLP parser.
    Extracts destination city/state, duration, budget, accessibility, interests, and radius constraints.
    """
    text = query.lower()
    
    # 1. Destination Extraction
    dest_city = current_city
    dest_state = None
    radius_km = None
    
    for key, meta in INDIAN_DESTINATIONS.items():
        if key in text:
            dest_city = meta["city"]
            dest_state = meta["state"]
            break

    # Check for near-me / radius requests
    if "near me" in text or "nearby" in text or "around me" in text or "close to me" in text:
        radius_km = 10.0
        rad_match = re.search(r'(?:within|around|radius of)?\s*(\d+)\s*(?:km|kms|kilometers|kilometer)', text)
        if rad_match:
            try:
                radius_km = float(rad_match.group(1))
            except Exception:
                pass

    # 2. Budget extraction (₹2,000 / 2000 inr / 1500 rs / budget of 1000)
    budget = 2000.0
    budget_match = re.search(r'(?:₹|rs\.?|inr|budget\s*(?:of|under|is)?)\s*([\d,]+)', text)
    if not budget_match:
        budget_match = re.search(r'([\d,]+)\s*(?:₹|rs|inr|rupees|bucks)', text)
    if budget_match:
        try:
            val_str = budget_match.group(1).replace(',', '')
            val = float(val_str)
            if val > 50:
                budget = val
        except Exception:
            pass

    # 3. Duration extraction (4 hours, 3 hrs, 120 mins, 90 minutes)
    duration_mins = 240
    hours_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:hours|hour|hrs|hr)', text)
    mins_match = re.search(r'(\d+)\s*(?:minutes|mins|min)', text)
    if hours_match:
        try:
            duration_mins = int(float(hours_match.group(1)) * 60)
        except Exception:
            pass
    elif mins_match:
        try:
            duration_mins = int(mins_match.group(1))
        except Exception:
            pass

    # 4. Group type & size
    group_type = "solo"
    group_size = 1
    if any(k in text for k in ["family", "parents", "kids", "children", "mom", "dad"]):
        group_type = "family"
        group_size = 4
    elif any(k in text for k in ["couple", "partner", "wife", "husband", "girlfriend", "boyfriend", "with my friend"]):
        group_type = "couple"
        group_size = 2
    elif any(k in text for k in ["friends", "group", "colleagues", "team", "buddies"]):
        group_type = "friends"
        group_size = 4
    elif any(k in text for k in ["senior", "elderly", "grandparents"]):
        group_type = "seniors"
        group_size = 2

    # Check explicit number of people
    people_match = re.search(r'(\d+)\s*(?:people|persons|pax|members|of us)', text)
    if people_match:
        try:
            group_size = int(people_match.group(1))
        except Exception:
            pass

    # 5. Interests
    interests = []
    interest_map = {
        "food": ["food", "eat", "dining", "snack", "kachori", "chai", "lunch", "dinner", "breakfast", "street food", "culinary", "taste", "sweets", "vada pav", "biryani", "seafood", "thali", "dosa", "chaat"],
        "culture": ["culture", "cultural", "heritage", "history", "temple", "palace", "museum", "tradition", "monument", "haveli", "ghat", "aarti", "fort", "ashram"],
        "workshop": ["workshop", "pottery", "block printing", "craft", "art", "learn", "class", "handmade", "puppet", "handloom", "painting"],
        "hidden_gem": ["hidden gem", "offbeat", "less touristy", "not touristy", "secret", "local spot", "authentic", "unexplored", "non-touristy"],
        "adventure": ["adventure", "trek", "hike", "cycling", "walk", "outdoor", "safari", "sunrise", "rafting", "kayak", "scuba"],
        "nature": ["nature", "beach", "waterfall", "mountain", "hills", "backwaters", "tea garden", "lake", "forest", "wildlife"],
        "shopping": ["shopping", "bazaar", "market", "souvenir", "textile", "jewelry", "handicraft", "spices"],
        "nightlife": ["nightlife", "evening", "sunset", "rooftop", "cafe", "music", "night market", "club"]
    }
    for cat, keywords in interest_map.items():
        if any(kw in text for kw in keywords):
            interests.append(cat)
    if not interests:
        interests = ["food", "culture"]

    # 6. Accessibility requirements
    low_walking = False
    if any(k in text for k in ["low walking", "less walking", "don't want much walking", "avoid walking", "minimal walking", "tired", "elderly", "parents", "easy pace", "no stairs"]):
        low_walking = True
        
    wheelchair = False
    if any(k in text for k in ["wheelchair", "accessible", "ramp", "step free"]):
        wheelchair = True

    # 7. Hidden gem mode preference
    hidden_gem_pref = False
    if any(k in text for k in ["hidden gem", "not touristy", "non touristy", "off the beaten", "secret", "local only", "undiscovered"]):
        hidden_gem_pref = True

    return StructuredIntent(
        destination_city=dest_city,
        destination_state=dest_state,
        location=dest_city or "current location",
        duration_minutes=duration_mins,
        budget=budget,
        currency="INR",
        interests=interests,
        group_type=group_type,
        group_size=group_size,
        accessibility={
            "low_walking": low_walking,
            "wheelchair": wheelchair,
            "family_friendly": group_type == "family"
        },
        hidden_gem_preference=hidden_gem_pref,
        radius_km=radius_km,
        preferred_start_time="10:00",
        raw_query=query
    )


async def extract_intent_with_llm(query: str, user_location: Optional[Dict[str, float]] = None, current_city: Optional[str] = None) -> StructuredIntent:
    """
    Calls OpenAI if API key is provided; otherwise seamlessly uses high-precision fallback parser.
    """
    if not settings.OPENAI_API_KEY:
        return extract_intent_fallback(query, user_location, current_city)

    prompt = f"""
    Extract structured traveler constraints across India from this query: "{query}".
    Current Context: City={current_city or 'Unspecified'}
    Return strictly JSON conforming to:
    {{
      "destination_city": "string or null (e.g. Mumbai, Kochi, Goa, Delhi, Varanasi, Jaipur, Bengaluru)",
      "destination_state": "string or null (e.g. Maharashtra, Kerala, Goa, Delhi, Uttar Pradesh, Rajasthan, Karnataka)",
      "location": "string (neighborhood or area if specified)",
      "duration_minutes": integer (total minutes available, e.g. 240 for 4 hours),
      "budget": float (in INR total budget),
      "currency": "INR",
      "interests": ["food", "culture", "workshop", "hidden_gem", "adventure", "nature", "shopping", "nightlife"],
      "group_type": "solo" | "couple" | "family" | "friends" | "seniors",
      "group_size": integer,
      "accessibility": {{
        "low_walking": boolean,
        "wheelchair": boolean,
        "family_friendly": boolean
      }},
      "hidden_gem_preference": boolean,
      "radius_km": float or null,
      "preferred_start_time": "HH:MM"
    }}
    """
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            res = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": settings.OPENAI_MODEL,
                    "messages": [
                        {"role": "system", "content": "You are an India-wide travel intent extraction engine. Return ONLY valid JSON."},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.1,
                    "response_format": {"type": "json_object"}
                }
            )
            if res.status_code == 200:
                data = res.json()
                content = data["choices"][0]["message"]["content"]
                parsed = json.loads(content)
                parsed["raw_query"] = query
                return StructuredIntent(**parsed)
    except Exception as e:
        logger.warning(f"OpenAI API call failed or timed out: {e}. Using fallback parser.")

    return extract_intent_fallback(query, user_location, current_city)


def generate_why_it_fits_bullets(
    experience_dict: Dict[str, Any],
    intent: StructuredIntent,
    distance_km: float,
    travel_time_mins: int
) -> List[str]:
    """
    Generates contextual, explainable 'Why this fits you' bullets grounded in database facts.
    """
    bullets = []
    
    # 1. Budget Fit
    price = experience_dict.get("price", 0.0)
    total_cost = price * intent.group_size if price > 0 else 0
    if price == 0:
        bullets.append("✓ Free local community experience (zero budget required)")
    elif total_cost <= intent.budget:
        bullets.append(f"✓ Fits within your ₹{int(intent.budget):,} budget (₹{int(price)}/person)")
    else:
        bullets.append(f"✓ Priced at ₹{int(price)} per person")

    # 2. Distance & Proximity
    neighborhood = experience_dict.get("neighborhood", "")
    city = experience_dict.get("city", "")
    if distance_km < 1.0:
        bullets.append(f"✓ Right around the corner in {neighborhood} (~{int(distance_km*1000)}m away)")
    elif travel_time_mins <= 20:
        bullets.append(f"✓ Only {travel_time_mins} min ride in {neighborhood}, {city}")
    else:
        bullets.append(f"✓ Located in {neighborhood} ({distance_km:.1f} km away)")

    # 3. Accessibility / Pace
    if intent.accessibility.get("low_walking") and experience_dict.get("accessibility_low_walking"):
        bullets.append("✓ Low walking required — seated or easy flat access")
    elif intent.accessibility.get("wheelchair") and experience_dict.get("accessibility_wheelchair"):
        bullets.append("✓ Full step-free / wheelchair accessibility verified")
    
    # 4. Group / Traveler Type
    if intent.group_type == "family" and experience_dict.get("accessibility_family_friendly"):
        bullets.append("✓ Welcoming and comfortable for families with parents/kids")
    elif intent.group_type == "seniors" and experience_dict.get("accessibility_senior_friendly"):
        bullets.append("✓ Relaxed pace suitable for senior travelers")
        
    # 5. Timing & Category
    closing_time = experience_dict.get("closing_time", "21:00")
    bullets.append(f"✓ Open until {closing_time}")
    
    if experience_dict.get("is_hidden_gem") and intent.hidden_gem_preference:
        bullets.append("✓ Authentic hidden gem — off the standard tourist bus route")

    return bullets[:4]
