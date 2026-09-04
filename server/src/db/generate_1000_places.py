import sqlite3
import json
import random

# Target cities with rich data
TARGET_CITIES = {
    "Mumbai": {"state": "Maharashtra", "lat": 19.0760, "lng": 72.8777},
    "Delhi": {"state": "Delhi", "lat": 28.6139, "lng": 77.2090},
    "Jaipur": {"state": "Rajasthan", "lat": 26.9124, "lng": 75.7873},
    "Goa": {"state": "Goa", "lat": 15.4909, "lng": 73.8278},
    "Bengaluru": {"state": "Karnataka", "lat": 12.9716, "lng": 77.5946},
    "Kochi": {"state": "Kerala", "lat": 9.9312, "lng": 76.2673},
}

# Neighborhoods per city
NEIGHBORHOODS = {
    "Mumbai": ["Bandra", "Colaba", "Juhu", "Fort", "Dadar", "Worli", "Powai", "Andheri", "Malad", "Goregaon"],
    "Delhi": ["Old Delhi", "Connaught Place", "Hauz Khas", "Nizamuddin", "Mehrauli", "Paharganj", "Karol Bagh", "Lodhi", "Rajouri Garden", "Saket"],
    "Jaipur": ["Pink City", "Amer", "Johari Bazaar", "MI Road", "C-Scheme", "Sanganer", "Jal Mahal", "Nahargarh", "Galta", "Sisodia Rani"],
    "Goa": ["Panjim", "Anjuna", "Palolem", "Fontainhas", "Assagao", "Candolim", "Vagator", "Calangute", "Mapusa", "Canacona"],
    "Bengaluru": ["Indiranagar", "Koramangala", "Malleshwaram", "Jayanagar", "Whitefield", "HSR Layout", "BTM", "Cubbon Park", "Ulsoor", "Basavanagudi"],
    "Kochi": ["Fort Kochi", "Mattancherry", "Ernakulam", "Marine Drive", "Jew Town", "Kumbalangi", "Vypeen", "Cherai", "Thripunithura", "Aluva"],
}

# Experience type templates with categories
EXPERIENCE_TYPES = [
    # Food & Culinary
    {"prefix": "Traditional", "suffix": "Street Food Walk & Local Delicacies Tasting", "category": "food", "price_range": (100, 300), "duration": 60},
    {"prefix": "Heritage", "suffix": "Restaurant Traditional Thali & Cultural Meal", "category": "food", "price_range": (200, 500), "duration": 75},
    {"prefix": "Local Market", "suffix": "Fresh Produce Shopping & Cooking Class", "category": "workshop", "price_range": (400, 700), "duration": 120},
    {"prefix": "Spice Bazaar", "suffix": "Aromatic Walking Tour & Tea Tasting", "category": "food", "price_range": (150, 350), "duration": 60},
    {"prefix": "Rooftop", "suffix": "Cafe Sunset Views & Local Coffee Tasting", "category": "food", "price_range": (200, 400), "duration": 60},

    # Culture & Heritage
    {"prefix": "Historic", "suffix": "Temple Morning Prayers & Architecture Walk", "category": "culture", "price_range": (0, 200), "duration": 75},
    {"prefix": "Heritage", "suffix": "Building Colonial Architecture Photography Tour", "category": "culture", "price_range": (250, 450), "duration": 90},
    {"prefix": "Art Gallery", "suffix": "Contemporary Art Exhibition & Artist Meetup", "category": "culture", "price_range": (150, 350), "duration": 75},
    {"prefix": "Museum", "suffix": "Historical Artifacts & Storytelling Session", "category": "culture", "price_range": (100, 300), "duration": 90},
    {"prefix": "Street Art", "suffix": "Mural Walk & Graffiti Workshop", "category": "culture", "price_range": (200, 400), "duration": 90},

    # Workshops & Learning
    {"prefix": "Pottery", "suffix": "Studio Wheel Throwing & Clay Crafting Session", "category": "workshop", "price_range": (400, 700), "duration": 120},
    {"prefix": "Block Printing", "suffix": "Traditional Textile Workshop & Natural Dye Demo", "category": "workshop", "price_range": (500, 800), "duration": 120},
    {"prefix": "Dance", "suffix": "Classical Dance Introduction & Performance", "category": "workshop", "price_range": (350, 600), "duration": 90},
    {"prefix": "Music", "suffix": "Traditional Instrument Learning & Jam Session", "category": "workshop", "price_range": (400, 700), "duration": 90},
    {"prefix": "Yoga", "suffix": "Morning Meditation & Breathing Techniques Class", "category": "workshop", "price_range": (200, 450), "duration": 90},

    # Nature & Outdoors
    {"prefix": "Garden", "suffix": "Botanical Walk & Birdwatching Session", "category": "nature", "price_range": (100, 250), "duration": 90},
    {"prefix": "Lake", "suffix": "Sunrise Boat Ride & Nature Photography", "category": "nature", "price_range": (250, 500), "duration": 90},
    {"prefix": "Park", "suffix": "Evening Joggers Trail & Fitness Workshop", "category": "nature", "price_range": (0, 150), "duration": 60},
    {"prefix": "Beach", "suffix": "Sunset Walk & Coastal Photography Session", "category": "nature", "price_range": (100, 300), "duration": 75},
    {"prefix": "Hill", "suffix": "Sunrise Trek & Panoramic Photography Workshop", "category": "adventure", "price_range": (300, 600), "duration": 120},

    # Hidden Gems & Local
    {"prefix": "Hidden Alley", "suffix": "Backstreet Discovery & Local Life Exploration", "category": "hidden_gem", "price_range": (0, 200), "duration": 75},
    {"prefix": "Secret Garden", "suffix": "Peaceful Courtyard & Meditation Session", "category": "hidden_gem", "price_range": (100, 300), "duration": 60},
    {"prefix": "Underground", "suffix": "Music Venue Live Performance & Jam Session", "category": "nightlife", "price_range": (300, 600), "duration": 120},
    {"prefix": "Vintage", "suffix": "Bookstore Literary Walk & Reading Session", "category": "shopping", "price_range": (0, 150), "duration": 60},
    {"prefix": "Local Artisan", "suffix": "Workshop Community Visit & Craft Demo", "category": "workshop", "price_range": (250, 500), "duration": 90},

    # Shopping & Markets
    {"prefix": "Flea Market", "suffix": "Handicrafts Shopping & Bargaining Experience", "category": "shopping", "price_range": (0, 200), "duration": 90},
    {"prefix": "Silk Bazaar", "suffix": "Traditional Weaving Demo & Textile Shopping", "category": "shopping", "price_range": (300, 600), "duration": 75},
    {"prefix": "Jewelry Market", "suffix": "Gemstone Workshop & Silver Craft Tour", "category": "shopping", "price_range": (400, 800), "duration": 90},
    {"prefix": "Organic Market", "suffix": "Farm Fresh Shopping & Sustainability Talk", "category": "shopping", "price_range": (100, 300), "duration": 75},

    # Nightlife & Entertainment
    {"prefix": "Rooftop Bar", "suffix": "Craft Cocktails & City Lights Panorama", "category": "nightlife", "price_range": (500, 1000), "duration": 120},
    {"prefix": "Live Music", "suffix": "Local Band Performance & Open Mic Night", "category": "nightlife", "price_range": (300, 600), "duration": 150},
    {"prefix": "Theater", "suffix": "Traditional Play Performance & Backstage Tour", "category": "culture", "price_range": (250, 500), "duration": 120},

    # Spiritual & Wellness
    {"prefix": "Meditation", "suffix": "Center Silent Retreat & Mindfulness Session", "category": "spiritual", "price_range": (150, 400), "duration": 90},
    {"prefix": "Temple", "suffix": "Evening Aarti Ceremony & Spiritual Discussion", "category": "spiritual", "price_range": (0, 150), "duration": 60},
    {"prefix": "Ayurveda", "suffix": "Wellness Center Massage & Herbal Tea Therapy", "category": "workshop", "price_range": (600, 1200), "duration": 120},
]

# Image URLs by category
CATEGORY_IMAGES = {
    "food": [
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
        "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=80",
        "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80",
        "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80",
    ],
    "culture": [
        "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=800&q=80",
        "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&q=80",
        "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&q=80",
        "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&q=80",
    ],
    "workshop": [
        "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=80",
        "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=800&q=80",
        "https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=800&q=80",
        "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=80",
    ],
    "nature": [
        "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80",
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
        "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80",
        "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&q=80",
    ],
    "hidden_gem": [
        "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800&q=80",
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80",
        "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&q=80",
    ],
    "adventure": [
        "https://images.unsplash.com/photo-1530866495561-507c9faab2ed?w=800&q=80",
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
        "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
    ],
    "spiritual": [
        "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&q=80",
        "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80",
        "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80",
    ],
    "shopping": [
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
        "https://images.unsplash.com/photo-1506452819137-0422416856b8?w=800&q=80",
        "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&q=80",
    ],
    "nightlife": [
        "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80",
        "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80",
        "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80",
    ],
}

def main():
    conn = sqlite3.connect('server/lokiva.sqlite')
    cursor = conn.cursor()

    experiences_per_city = 200  # Target 200 per city = 1200 total

    print("=" * 60)
    print(f"GENERATING {experiences_per_city} EXPERIENCES FOR 6 CITIES")
    print("=" * 60)

    total_inserted = 0

    for city_name, city_data in TARGET_CITIES.items():
        print(f"\nGenerating experiences for {city_name}...")

        neighborhoods = NEIGHBORHOODS[city_name]

        for i in range(experiences_per_city):
            # Select template and neighborhood
            template = random.choice(EXPERIENCE_TYPES)
            neighborhood = neighborhoods[i % len(neighborhoods)]

            # Build title
            title = f"{neighborhood} {template['prefix']} {template['suffix']}"

            # Get image for category
            category = template['category']
            images = CATEGORY_IMAGES.get(category, CATEGORY_IMAGES['culture'])
            image_url = random.choice(images)

            # Random variations
            price = random.randint(template['price_range'][0], template['price_range'][1])
            duration = template['duration'] + random.randint(-15, 15)
            rating = round(random.uniform(4.6, 5.0), 1)
            review_count = random.randint(15, 200)

            # Coordinates with slight jitter
            lat = city_data['lat'] + (random.random() - 0.5) * 0.05
            lng = city_data['lng'] + (random.random() - 0.5) * 0.05

            # Insert experience
            try:
                cursor.execute('''
                    INSERT INTO experiences (
                        provider_id, title, tagline, description, category, cultural_context,
                        state, city, area_name, latitude, longitude, approx_duration_mins, price,
                        currency, max_capacity, difficulty_level, is_indoor, is_rain_safe, is_hidden_gem,
                        is_family_friendly, low_walking, wheelchair_accessible, best_time_of_day,
                        rating, review_count, image_urls, tags, is_active
                    ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'INR', 15, 'easy',
                             ?, 1, ?, 1, 1, 1, ?, ?, ?, ?, ?, 1)
                ''', [
                    title,
                    f"Authentic local experience in {neighborhood}",
                    f"Discover the rich cultural heritage of {neighborhood}, {city_name}. Guided by local experts who share generations of tradition and stories.",
                    category,
                    f"Experience traditional {category} in {city_name}",
                    city_data['state'],
                    city_name,
                    neighborhood,
                    lat,
                    lng,
                    duration,
                    price,
                    1 if category in ['workshop', 'food', 'shopping'] else 0,
                    1 if category == 'hidden_gem' else 0,
                    'morning' if category in ['nature', 'spiritual'] else 'evening',
                    rating,
                    review_count,
                    json.dumps([image_url]),
                    json.dumps([category, city_name.lower(), neighborhood.lower()]),
                ])
                total_inserted += 1

                if (i + 1) % 50 == 0:
                    print(f"  Inserted {i + 1}/{experiences_per_city} experiences...")
                    conn.commit()

            except Exception as e:
                print(f"  Error inserting experience: {e}")
                continue

        conn.commit()
        print(f"  Completed {city_name}: {experiences_per_city} experiences inserted")

    # Final stats
    cursor.execute('SELECT COUNT(*) FROM experiences WHERE image_urls != "[]" AND image_urls IS NOT NULL AND image_urls != ""')
    with_images = cursor.fetchone()[0]

    cursor.execute('SELECT COUNT(*) FROM experiences')
    total = cursor.fetchone()[0]

    print("\n" + "=" * 60)
    print(f"GENERATION COMPLETE!")
    print(f"Total experiences in database: {total}")
    print(f"Experiences with images: {with_images}")
    print(f"New experiences inserted: {total_inserted}")
    print("=" * 60)

    conn.close()

if __name__ == "__main__":
    main()
