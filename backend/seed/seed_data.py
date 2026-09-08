import datetime
import random
import sys

# Ensure UTF-8 output on Windows terminal
sys.stdout.reconfigure(encoding='utf-8')

from sqlalchemy.orm import Session
from backend.app.core.database import SessionLocal, Base, engine
from backend.app.core.security import get_password_hash
from backend.app.models import (
    State, City, Area, User, TravelerProfile, Provider, Experience, 
    Availability, Review, Favorite, ProviderAnalytics
)

def seed_database():
    print("=" * 60)
    print("🌍 LOKIVA — SEEDING PAN-INDIA INTELLIGENT DISCOVERY PLATFORM")
    print("=" * 60)

    # Recreate tables cleanly
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()

    try:
        # =========================================================================
        # 1. SEED STATES & UNION TERRITORIES
        # =========================================================================
        print("🌱 Seeding Indian States & Union Territories...")
        states_data = [
            {"name": "Maharashtra", "code": "MH", "region": "West", "image_url": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800"},
            {"name": "Rajasthan", "code": "RJ", "region": "North", "image_url": "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800"},
            {"name": "Goa", "code": "GA", "region": "West", "image_url": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800"},
            {"name": "Kerala", "code": "KL", "region": "South", "image_url": "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800"},
            {"name": "Delhi", "code": "DL", "region": "North", "image_url": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800"},
            {"name": "Karnataka", "code": "KA", "region": "South", "image_url": "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800"},
            {"name": "Uttar Pradesh", "code": "UP", "region": "North", "image_url": "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800"},
            {"name": "Uttarakhand", "code": "UK", "region": "North", "image_url": "https://images.unsplash.com/photo-1605649487212-47bdab064df8?w=800"},
            {"name": "West Bengal", "code": "WB", "region": "East", "image_url": "https://images.unsplash.com/photo-1558431382-27e303142255?w=800"},
            {"name": "Meghalaya", "code": "ML", "region": "Northeast", "image_url": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800"},
            {"name": "Tamil Nadu", "code": "TN", "region": "South", "image_url": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800"},
            {"name": "Telangana", "code": "TS", "region": "South", "image_url": "https://images.unsplash.com/photo-1605007493699-af65834f8a00?w=800"},
            {"name": "Punjab", "code": "PB", "region": "North", "image_url": "https://images.unsplash.com/photo-1588714477688-cf28a50e94f7?w=800"},
            {"name": "Gujarat", "code": "GJ", "region": "West", "image_url": "https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800"},
            {"name": "Himachal Pradesh", "code": "HP", "region": "North", "image_url": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800"}
        ]

        state_objects = {}
        for s in states_data:
            state = State(**s)
            db.add(state)
            state_objects[s["name"]] = state
        db.commit()

        # =========================================================================
        # 2. SEED CITIES & DESTINATIONS
        # =========================================================================
        print("🌱 Seeding Indian Cities & Destination Hubs...")
        cities_data = [
            # Maharashtra
            {"name": "Mumbai", "state_id": state_objects["Maharashtra"].id, "tagline": "The City of Dreams & Coastal Alleys", "latitude": 19.0760, "longitude": 72.8777, "image_url": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800", "is_popular": True, "description": "From colonial art deco promenades to bustling street kebab lanes and fishing villages."},
            {"name": "Pune", "state_id": state_objects["Maharashtra"].id, "tagline": "Cultural Heart of the Marathas", "latitude": 18.5204, "longitude": 73.8567, "image_url": "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=800", "is_popular": True, "description": "Heritage Wada architecture, student cafe culture, and Western Ghats foothill trails."},
            
            # Rajasthan
            {"name": "Jaipur", "state_id": state_objects["Rajasthan"].id, "tagline": "The Historic Pink City of Crafts & Havelis", "latitude": 26.9124, "longitude": 75.7873, "image_url": "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800", "is_popular": True, "description": "Royal palaces, 5th-generation hand block printing, and centuries-old sweet houses."},
            {"name": "Udaipur", "state_id": state_objects["Rajasthan"].id, "tagline": "The City of Lakes & Royal Courtyards", "latitude": 24.5854, "longitude": 73.7125, "image_url": "https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?w=800", "is_popular": True, "description": "Tranquil lake boat rides, miniature painting ateliers, and sunset rooftop ghats."},

            # Goa
            {"name": "Goa", "state_id": state_objects["Goa"].id, "tagline": "Sun-Dappled Latin Quarters & Spice Plantations", "latitude": 15.4909, "longitude": 73.8278, "image_url": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800", "is_popular": True, "description": "Portuguese heritage villas, hidden river islands, artisanal feni tasting, and sunset beaches."},

            # Kerala
            {"name": "Kochi", "state_id": state_objects["Kerala"].id, "tagline": "Queen of the Arabian Sea & Spice Route", "latitude": 9.9312, "longitude": 76.2673, "image_url": "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800", "is_popular": True, "description": "Chinese fishing nets, historic Jew Town spice warehouses, Kathakali and backwater canoe trails."},

            # Delhi
            {"name": "Delhi", "state_id": state_objects["Delhi"].id, "tagline": "The Imperial Capital of Empires & Chaat", "latitude": 28.6139, "longitude": 77.2090, "image_url": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800", "is_popular": True, "description": "Mughal walled city alleys, Sufi qawwalis, Lodhi garden art walks, and legendary food trails."},

            # Karnataka
            {"name": "Bengaluru", "state_id": state_objects["Karnataka"].id, "tagline": "The Garden City of Microbreweries & Filter Coffee", "latitude": 12.9716, "longitude": 77.5946, "image_url": "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800", "is_popular": True, "description": "Heritage tiffin rooms, tree-lined botanical parks, indie music circles, and silk markets."},

            # Uttar Pradesh
            {"name": "Varanasi", "state_id": state_objects["Uttar Pradesh"].id, "tagline": "The Eternal Spiritual City on the Holy Ganges", "latitude": 25.3176, "longitude": 82.9739, "image_url": "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800", "is_popular": True, "description": "Sunrise boat rituals along 84 ghats, evening Ganga Aarti, Banarasi silk looms, and malaiyo sweets."},
            {"name": "Lucknow", "state_id": state_objects["Uttar Pradesh"].id, "tagline": "The City of Nawabs, Chikankari & Kebabs", "latitude": 26.8467, "longitude": 80.9462, "image_url": "https://images.unsplash.com/photo-1627894006066-b45781a70823?w=800", "is_popular": True, "description": "Melting Galouti kebabs, ornate Imambaras, exquisite shadow-work embroidery, and Urdu poetry."},

            # Uttarakhand
            {"name": "Rishikesh", "state_id": state_objects["Uttarakhand"].id, "tagline": "The Yoga Capital & Himalayan River Valley", "latitude": 30.0869, "longitude": 78.2676, "image_url": "https://images.unsplash.com/photo-1605649487212-47bdab064df8?w=800", "is_popular": True, "description": "Ganga whitewater rafting, cliff-side organic cafes, sound healing, and pine forest trails."},

            # West Bengal
            {"name": "Kolkata", "state_id": state_objects["West Bengal"].id, "tagline": "The Cultural Capital of Art, Tramways & Sweets", "latitude": 22.5726, "longitude": 88.3639, "image_url": "https://images.unsplash.com/photo-1558431382-27e303142255?w=800", "is_popular": True, "description": "Clay idol potters of Kumartuli, vintage College Street book bazaars, kathi rolls, and mishti doi."},
            {"name": "Darjeeling", "state_id": state_objects["West Bengal"].id, "tagline": "Queen of the Hills & Champagne of Teas", "latitude": 27.0410, "longitude": 88.2663, "image_url": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800", "is_popular": True, "description": "Heritage steam toy train, morning views of Mt. Kanchenjunga, and organic tea estate plucking."},

            # Meghalaya
            {"name": "Shillong", "state_id": state_objects["Meghalaya"].id, "tagline": "The Scotland of the East & Living Root Bridges", "latitude": 25.5788, "longitude": 91.8933, "image_url": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800", "is_popular": True, "description": "Pristine canyon viewpoints, Khasi indigenous bamboo crafts, indie rock cafes, and waterfalls."},

            # Punjab
            {"name": "Amritsar", "state_id": state_objects["Punjab"].id, "tagline": "The Golden City of Devotion & Legendary Kulchas", "latitude": 31.6340, "longitude": 74.8723, "image_url": "https://images.unsplash.com/photo-1588714477688-cf28a50e94f7?w=800", "is_popular": True, "description": "Harmandir Sahib Golden Temple langar, crispy butter-soaked kulchas, and Phulkari embroidery."}
        ]

        city_objects = {}
        for c in cities_data:
            city = City(**c)
            db.add(city)
            city_objects[c["name"]] = city
        db.commit()

        # =========================================================================
        # 3. SEED USERS & PROVIDERS
        # =========================================================================
        print("🌱 Seeding Demo Users & Verified Providers...")
        # 1. Aarav Sharma (Traveler)
        traveler_user = User(
            email="aarav@lokiva.com",
            full_name="Aarav Sharma",
            hashed_password=get_password_hash("traveler123"),
            role="traveler"
        )
        db.add(traveler_user)
        db.commit()
        db.refresh(traveler_user)

        profile = TravelerProfile(
            user_id=traveler_user.id,
            traveler_type="Family",
            group_size=4,
            budget=2000.0,
            available_hours=4.0,
            interests=["food", "culture", "workshop"],
            accessibility_prefs={"low_walking": True, "wheelchair": False, "family_friendly": True},
            current_city="Mumbai",
            current_state="Maharashtra",
            location_name="Bandra / Hotel Stay",
            hotel_lat=19.0596,
            hotel_lng=72.8295
        )
        db.add(profile)

        # 2. Local Artisan Guild (Provider)
        provider_user = User(
            email="provider@lokiva.com",
            full_name="India Artisan Heritage Guild",
            hashed_password=get_password_hash("provider123"),
            role="provider"
        )
        db.add(provider_user)
        db.commit()
        db.refresh(provider_user)

        provider_obj = Provider(
            user_id=provider_user.id,
            business_name="India Local Craft & Culinary Collective",
            description="Verified network of master craftspersons, traditional culinary custodians, and licensed heritage storytellers across India.",
            contact_email="guild@lokiva.com",
            phone="+91 98290 12345",
            city="Mumbai",
            state="Maharashtra",
            address="Kala Ghoda Heritage Arts Precinct",
            is_verified=True,
            rating=4.9,
            total_reviews=284
        )
        db.add(provider_obj)

        # 3. Admin User
        admin_user = User(
            email="admin@lokiva.com",
            full_name="LOKIVA Platform Admin",
            hashed_password=get_password_hash("admin123"),
            role="admin"
        )
        db.add(admin_user)
        db.commit()
        db.refresh(provider_obj)

        # =========================================================================
        # 4. SEED 200+ CURATED EXPERIENCES ACROSS INDIA
        # =========================================================================
        print("🌱 Seeding 200+ Curated Experiences across India...")

        experiences_catalog = [
            # -------------------------------------------------------------
            # MUMBAI (MAHARASHTRA) — West
            # -------------------------------------------------------------
            {
                "city": "Mumbai", "state": "Maharashtra", "neighborhood": "Bandra",
                "title": "Ranwar Village Indo-Portuguese Heritage Walk & Irani Chai",
                "description": "Stroll through quiet 18th-century East Indian heritage lanes, vintage Catholic grottoes, street murals, and enjoy bun maska with Irani chai.",
                "category": "culture", "latitude": 19.0558, "longitude": 72.8295, "address": "Ranwar Village, Bandra West, Mumbai",
                "price": 350.0, "duration_mins": 90, "is_indoor": False, "is_hidden_gem": True,
                "accessibility_low_walking": True, "accessibility_family_friendly": True, "dietary_vegetarian": True,
                "rating": 4.9, "review_count": 64, "tags": ["heritage", "irani chai", "murals", "vintage"],
                "images": ["https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800"]
            },
            {
                "city": "Mumbai", "state": "Maharashtra", "neighborhood": "Dadar",
                "title": "Aaswad Traditional Maharashtrian Thalipeeth & Kothimbir Vadi Tasting",
                "description": "Relish award-winning authentic Maharashtrian delicacies: crispy multigrain thalipeeth, steamed kothimbir vadi, and fresh piyush drink.",
                "category": "food", "latitude": 19.0222, "longitude": 72.8427, "address": "Opposite Shiv Sena Bhavan, Dadar West, Mumbai",
                "price": 180.0, "duration_mins": 45, "is_indoor": True, "is_hidden_gem": False,
                "accessibility_low_walking": True, "accessibility_family_friendly": True, "dietary_vegetarian": True,
                "rating": 4.9, "review_count": 142, "tags": ["maharashtrian", "thalipeeth", "snack", "award winning"],
                "images": ["https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800"]
            },
            {
                "city": "Mumbai", "state": "Maharashtra", "neighborhood": "Kala Ghoda",
                "title": "Kala Ghoda Art Deco Walk & Contemporary Pottery Studio",
                "description": "Discover Victorian Gothic and Art Deco buildings followed by a hands-on wheel throwing session with an independent ceramic artist.",
                "category": "workshop", "latitude": 18.9288, "longitude": 72.8331, "address": "Kala Ghoda Arts Precinct, Fort, Mumbai",
                "price": 600.0, "duration_mins": 90, "is_indoor": True, "is_hidden_gem": True,
                "accessibility_low_walking": True, "accessibility_family_friendly": True, "dietary_vegetarian": True,
                "rating": 4.8, "review_count": 48, "tags": ["pottery", "art deco", "workshop", "kala ghoda"],
                "images": ["https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800"]
            },
            {
                "city": "Mumbai", "state": "Maharashtra", "neighborhood": "Colaba",
                "title": "Sassoon Docks Morning Fisherman Action & Secret Sunset Pier",
                "description": "Experience Mumbai's oldest wet docks in action at dawn as Koli fisherfolk auction fresh catches, followed by a serene walk on the pier.",
                "category": "hidden_gem", "latitude": 18.9142, "longitude": 72.8228, "address": "Sassoon Docks, Colaba, Mumbai",
                "price": 0.0, "duration_mins": 60, "is_indoor": False, "is_hidden_gem": True,
                "accessibility_low_walking": False, "accessibility_family_friendly": True, "dietary_vegetarian": False,
                "rating": 4.7, "review_count": 52, "tags": ["coastal", "koli culture", "docks", "authentic"],
                "images": ["https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=800"]
            },
            {
                "city": "Mumbai", "state": "Maharashtra", "neighborhood": "Fort",
                "title": "Parsi Cafe Trail: Britannia & Co Berry Pulao & Caramel Custard",
                "description": "Taste iconic Bombay Parsi gastronomy inside a 100-year-old heritage establishment. Savor Iranian berry pulao and velvety caramel custard.",
                "category": "food", "latitude": 18.9352, "longitude": 72.8381, "address": "Ballard Estate, Fort, Mumbai",
                "price": 450.0, "duration_mins": 60, "is_indoor": True, "is_hidden_gem": False,
                "accessibility_low_walking": True, "accessibility_family_friendly": True, "dietary_vegetarian": False,
                "rating": 4.8, "review_count": 110, "tags": ["parsi", "berry pulao", "heritage cafe", "custard"],
                "images": ["https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800"]
            },
            {
                "city": "Mumbai", "state": "Maharashtra", "neighborhood": "Dharavi",
                "title": "Kumbharwada Clay Potter Colony Guild Masterclass",
                "description": "Witness 1,000+ Gujarati immigrant potters handcrafting terracotta diyas, matkas, and garden planters in Mumbai's oldest ceramic commune.",
                "category": "workshop", "latitude": 19.0435, "longitude": 72.8567, "address": "Kumbharwada, 90 Feet Road, Dharavi, Mumbai",
                "price": 250.0, "duration_mins": 75, "is_indoor": False, "is_hidden_gem": True,
                "accessibility_low_walking": True, "accessibility_family_friendly": True, "dietary_vegetarian": True,
                "rating": 4.9, "review_count": 76, "tags": ["pottery", "craft", "terracotta", "community"],
                "images": ["https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800"]
            },
            {
                "city": "Mumbai", "state": "Maharashtra", "neighborhood": "Marine Drive",
                "title": "Queen's Necklace Sunset Breeze & Roasted Bhutta Walk",
                "description": "Relax on the iconic sea-facing promenade listening to crashing waves while enjoying charcoal-roasted spiced corn on the cob.",
                "category": "nature", "latitude": 18.9438, "longitude": 72.8231, "address": "Marine Drive Promenade, Churchgate, Mumbai",
                "price": 50.0, "duration_mins": 45, "is_indoor": False, "is_hidden_gem": False,
                "accessibility_low_walking": True, "accessibility_family_friendly": True, "dietary_vegetarian": True,
                "rating": 4.9, "review_count": 210, "tags": ["sea view", "sunset", "promenade", "breeze"],
                "images": ["https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=800"]
            },

            # -------------------------------------------------------------
            # GOA — West
            # -------------------------------------------------------------
            {
                "city": "Goa", "state": "Goa", "neighborhood": "Fontainhas",
                "title": "Fontainhas Latin Quarter Pastel Houses & Bebinca Workshop",
                "description": "Explore narrow winding alleys of Asia's only Latin Quarter, painted in ochre and cobalt blue, followed by a 7-layer Bebinca baking demo.",
                "category": "culture", "latitude": 15.4989, "longitude": 73.8328, "address": "Fontainhas, Panaji, Goa",
                "price": 400.0, "duration_mins": 90, "is_indoor": False, "is_hidden_gem": True,
                "accessibility_low_walking": True, "accessibility_family_friendly": True, "dietary_vegetarian": True,
                "rating": 4.9, "review_count": 88, "tags": ["portuguese", "architecture", "bebinca", "latin quarter"],
                "images": ["https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800"]
            },
            {
                "city": "Goa", "state": "Goa", "neighborhood": "Divar Island",
                "title": "Divar Island Serene Electric Bicycle River Cruise & Local Feni Tasting",
                "description": "Take a flat wooden ferry to sleepy Divar Island, cycle through paddy fields and ancient churches, and learn traditional cashew feni distilling.",
                "category": "adventure", "latitude": 15.5122, "longitude": 73.8967, "address": "Divar Ferry Point, Goa",
                "price": 650.0, "duration_mins": 120, "is_indoor": False, "is_hidden_gem": True,
                "accessibility_low_walking": False, "accessibility_family_friendly": True, "dietary_vegetarian": True,
                "rating": 4.9, "review_count": 72, "tags": ["island", "cycling", "feni", "nature"],
                "images": ["https://images.unsplash.com/photo-1588096344356-9a4f4d2f091c?w=800"]
            },
            {
                "city": "Goa", "state": "Goa", "neighborhood": "Assagao",
                "title": "Organic Spice Plantation Farm-to-Table Goan Lunch & Herb Tour",
                "description": "Walk amidst vanilla vines, cardamom pods, and cinnamon bark followed by a banana-leaf lunch of Goan vegetable caldin and red rice.",
                "category": "food", "latitude": 15.5892, "longitude": 73.7745, "address": "Badem Road, Assagao, North Goa",
                "price": 500.0, "duration_mins": 90, "is_indoor": False, "is_hidden_gem": True,
                "accessibility_low_walking": True, "accessibility_family_friendly": True, "dietary_vegetarian": True,
                "rating": 4.8, "review_count": 94, "tags": ["spice plantation", "organic", "goan cuisine", "nature"],
                "images": ["https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?w=800"]
            },
            {
                "city": "Goa", "state": "Goa", "neighborhood": "Palolem",
                "title": "Butterfly Beach Hidden Kayaking & Bioluminescent Sunset Paddle",
                "description": "Glide in double kayaks past dolphin feeding bays to secluded Butterfly Cove for panoramic sunset reflections over the Arabian Sea.",
                "category": "adventure", "latitude": 15.0125, "longitude": 74.0211, "address": "Palolem Beach South End, Canacona, South Goa",
                "price": 600.0, "duration_mins": 105, "is_indoor": False, "is_hidden_gem": True,
                "accessibility_low_walking": False, "accessibility_family_friendly": True, "dietary_vegetarian": True,
                "rating": 4.9, "review_count": 82, "tags": ["kayak", "sunset", "beach", "hidden cove"],
                "images": ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800"]
            },

            # -------------------------------------------------------------
            # KOCHI (KERALA) — South
            # -------------------------------------------------------------
            {
                "city": "Kochi", "state": "Kerala", "neighborhood": "Fort Kochi",
                "title": "Chinese Fishing Nets Mechanics & Fresh Catch Tawa Fry Session",
                "description": "Operate 14th-century cantilevered fishing nets with local fishermen and have your selected catch freshly spiced and seared with curry leaves.",
                "category": "culture", "latitude": 9.9678, "longitude": 76.2428, "address": "Vasco da Gama Square, Fort Kochi",
                "price": 300.0, "duration_mins": 60, "is_indoor": False, "is_hidden_gem": False,
                "accessibility_low_walking": True, "accessibility_family_friendly": True, "dietary_vegetarian": False,
                "rating": 4.8, "review_count": 96, "tags": ["fishing nets", "seafood", "heritage", "harbor"],
                "images": ["https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800"]
            },
            {
                "city": "Kochi", "state": "Kerala", "neighborhood": "Jew Town",
                "title": "Jew Town Antique Spice Warehouse Aroma Walk & Ginger Drying Yards",
                "description": "Walk through 400-year-old spice trading lanes near the Paradesi Synagogue, inhaling sun-dried Malabar black pepper, star anise, and cardamom.",
                "category": "shopping", "latitude": 9.9575, "longitude": 76.2594, "address": "Synagogue Lane, Mattancherry, Kochi",
                "price": 100.0, "duration_mins": 45, "is_indoor": True, "is_hidden_gem": True,
                "accessibility_low_walking": True, "accessibility_family_friendly": True, "dietary_vegetarian": True,
                "rating": 4.9, "review_count": 78, "tags": ["spices", "antiques", "synagogue", "mattancherry"],
                "images": ["https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800"]
            },
            {
                "city": "Kochi", "state": "Kerala", "neighborhood": "Kumbalangi",
                "title": "Kumbalangi Integrated Village Backwater Canoe Trail & Crab Farming",
                "description": "Quiet country canoe tour through mangrove forests, coir yarn spinning by village women, and sustainable mud crab catching.",
                "category": "nature", "latitude": 9.8788, "longitude": 76.2845, "address": "Kumbalangi Tourism Village, Kochi Outskirts",
                "price": 450.0, "duration_mins": 120, "is_indoor": False, "is_hidden_gem": True,
                "accessibility_low_walking": True, "accessibility_family_friendly": True, "dietary_vegetarian": True,
                "rating": 4.9, "review_count": 84, "tags": ["backwaters", "canoe", "village life", "mangroves"],
                "images": ["https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=800"]
            },
            {
                "city": "Kochi", "state": "Kerala", "neighborhood": "Fort Kochi",
                "title": "Kathakali Green Room Facial Makeup Ritual & Mudra Demo",
                "description": "Watch classical Kathakali artists apply natural mineral makeup over 2 hours, followed by a live demonstration of eyes and hand mudras.",
                "category": "culture", "latitude": 9.9632, "longitude": 76.2441, "address": "Kerala Kathakali Centre, KB Jacob Road, Fort Kochi",
                "price": 350.0, "duration_mins": 90, "is_indoor": True, "is_hidden_gem": False,
                "accessibility_low_walking": True, "accessibility_family_friendly": True, "dietary_vegetarian": True,
                "rating": 4.9, "review_count": 115, "tags": ["kathakali", "dance", "tradition", "makeup"],
                "images": ["https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800"]
            },

            # -------------------------------------------------------------
            # DELHI — North
            # -------------------------------------------------------------
            {
                "city": "Delhi", "state": "Delhi", "neighborhood": "Old Delhi",
                "title": "Chandni Chowk 7-Stop Heritage Breakfast Trail: Daulat Ki Chaat & Jalebi",
                "description": "Wind through Dariba Kalan and Paranthe Wali Gali for winter foam cloud Daulat ki Chaat, giant saffron jalebis, and Bedmi Puri aloo.",
                "category": "food", "latitude": 28.6562, "longitude": 77.2301, "address": "Opposite Central Baptist Church, Chandni Chowk, Old Delhi",
                "price": 250.0, "duration_mins": 75, "is_indoor": False, "is_hidden_gem": False,
                "accessibility_low_walking": True, "accessibility_family_friendly": True, "dietary_vegetarian": True,
                "rating": 4.9, "review_count": 180, "tags": ["chandni chowk", "street food", "jalebi", "paranthe"],
                "images": ["https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800"]
            },
            {
                "city": "Delhi", "state": "Delhi", "neighborhood": "Nizamuddin",
                "title": "Hazrat Nizamuddin Dargah Evening Sufi Qawwali Circle",
                "description": "Sit in the historic 14th-century marble courtyard as traditional Qawwals sing mystical poetry of Amir Khusro under glowing brass lamps.",
                "category": "culture", "latitude": 28.5913, "longitude": 77.2415, "address": "Dargah Hazrat Nizamuddin Auliya, West Nizamuddin, Delhi",
                "price": 0.0, "duration_mins": 90, "is_indoor": True, "is_hidden_gem": True,
                "accessibility_low_walking": True, "accessibility_family_friendly": True, "dietary_vegetarian": True,
                "rating": 4.9, "review_count": 140, "tags": ["sufi", "qawwali", "spiritual", "nizamuddin"],
                "images": ["https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800"]
            },
            {
                "city": "Delhi", "state": "Delhi", "neighborhood": "Hauz Khas",
                "title": "Hauz Khas Medieval Madrasa Sunset & Indie Boutique Trail",
                "description": "Explore 13th-century Sultanate stone arches overlooking the deer park reservoir, followed by coffee at an independent rooftop book cafe.",
                "category": "hidden_gem", "latitude": 28.5494, "longitude": 77.1952, "address": "Hauz Khas Village, South Delhi",
                "price": 150.0, "duration_mins": 60, "is_indoor": False, "is_hidden_gem": True,
                "accessibility_low_walking": True, "accessibility_family_friendly": True, "dietary_vegetarian": True,
                "rating": 4.8, "review_count": 92, "tags": ["hauz khas", "ruins", "cafe", "sunset"],
                "images": ["https://images.unsplash.com/photo-1585130401366-fe05a8d813c4?w=800"]
            },
            {
                "city": "Delhi", "state": "Delhi", "neighborhood": "Lodhi Colony",
                "title": "Lodhi Art District Open-Air Street Mural & Botanical Garden Walk",
                "description": "India's first public art district featuring over 50 large-scale murals by international artists, followed by a shaded walk through Lodhi Gardens.",
                "category": "culture", "latitude": 28.5855, "longitude": 77.2255, "address": "Lodhi Art District, Lodhi Colony, New Delhi",
                "price": 0.0, "duration_mins": 60, "is_indoor": False, "is_hidden_gem": True,
                "accessibility_low_walking": True, "accessibility_family_friendly": True, "dietary_vegetarian": True,
                "rating": 4.9, "review_count": 68, "tags": ["street art", "murals", "gardens", "open air"],
                "images": ["https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800"]
            },

            # -------------------------------------------------------------
            # VARANASI (UTTAR PRADESH) — North
            # -------------------------------------------------------------
            {
                "city": "Varanasi", "state": "Uttar Pradesh", "neighborhood": "Assi Ghat",
                "title": "Subah-e-Banaras Morning Raga Flute Recital & Wooden Rowing Boat Ride",
                "description": "Experience divine dawn classical morning ragas, Surya Namaskar by sadhus, and a wooden rowing boat past historical palaces along the Ganges.",
                "category": "culture", "latitude": 25.2896, "longitude": 83.0068, "address": "Assi Ghat, Shivala, Varanasi",
                "price": 200.0, "duration_mins": 90, "is_indoor": False, "is_hidden_gem": False,
                "accessibility_low_walking": True, "accessibility_family_friendly": True, "dietary_vegetarian": True,
                "rating": 4.9, "review_count": 135, "tags": ["ganga boat", "sunrise", "subah-e-banaras", "spiritual"],
                "images": ["https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800"]
            },
            {
                "city": "Varanasi", "state": "Uttar Pradesh", "neighborhood": "Kashi Vishwanath Lanes",
                "title": "Blue Lassi Shop Hand-Churned Fruit Lassi & Peda Tasting",
                "description": "Sit on clay benches in a century-old alleyway watching thick creamy curd hand-churned in earthen matkas with pomegranate and pistachio.",
                "category": "food", "latitude": 25.3112, "longitude": 83.0135, "address": "CK 12/40 Bangali Tola, Varanasi",
                "price": 80.0, "duration_mins": 30, "is_indoor": True, "is_hidden_gem": True,
                "accessibility_low_walking": True, "accessibility_family_friendly": True, "dietary_vegetarian": True,
                "rating": 4.9, "review_count": 160, "tags": ["lassi", "sweets", "alleyway", "curd"],
                "images": ["https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=800"]
            },
            {
                "city": "Varanasi", "state": "Uttar Pradesh", "neighborhood": "Madanpura",
                "title": "Master Banarasi Silk Pit-Loom Weaving & Zari Brocade Masterclass",
                "description": "Meet 4th-generation Muslim master weavers crafting intricate gold zari motifs on hand-cranked jacquard looms in traditional living rooms.",
                "category": "workshop", "latitude": 25.3055, "longitude": 83.0021, "address": "Madanpura Weaver Colony, Varanasi",
                "price": 250.0, "duration_mins": 60, "is_indoor": True, "is_hidden_gem": True,
                "accessibility_low_walking": True, "accessibility_family_friendly": True, "dietary_vegetarian": True,
                "rating": 4.8, "review_count": 55, "tags": ["silk", "handloom", "zari", "artisan"],
                "images": ["https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=800"]
            },

            # -------------------------------------------------------------
            # RISHIKESH (UTTARAKHAND) — North
            # -------------------------------------------------------------
            {
                "city": "Rishikesh", "state": "Uttarakhand", "neighborhood": "Tapovan",
                "title": "Tibetan Singing Bowl Sound Bath & Himalayan Herbal Chai",
                "description": "Deep meditation and frequency relaxation inside a cedar-scented studio with views of the cascading river, followed by freshly brewed spiced chai.",
                "category": "workshop", "latitude": 30.1255, "longitude": 78.3188, "address": "High Bank, Tapovan, Rishikesh",
                "price": 400.0, "duration_mins": 60, "is_indoor": True, "is_hidden_gem": True,
                "accessibility_low_walking": True, "accessibility_family_friendly": True, "dietary_vegetarian": True,
                "rating": 4.9, "review_count": 92, "tags": ["sound healing", "meditation", "wellness", "himalayas"],
                "images": ["https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800"]
            },
            {
                "city": "Rishikesh", "state": "Uttarakhand", "neighborhood": "Shivpuri",
                "title": "Ganges River Grade-III Whitewater Rafting & Cliff Jump",
                "description": "Navigate exciting Himalayan river rapids (Roller Coaster, Golf Course) with certified river rescue guides, ending with an optional 20ft jump.",
                "category": "adventure", "latitude": 30.1388, "longitude": 78.3888, "address": "Shivpuri Rafting Base, Rishikesh",
                "price": 850.0, "duration_mins": 150, "is_indoor": False, "is_hidden_gem": False,
                "accessibility_low_walking": False, "accessibility_family_friendly": False, "dietary_vegetarian": True,
                "rating": 4.9, "review_count": 175, "tags": ["rafting", "whitewater", "adventure", "ganges"],
                "images": ["https://images.unsplash.com/photo-1530866495561-507c9faab2ed?w=800"]
            },
            {
                "city": "Rishikesh", "state": "Uttarakhand", "neighborhood": "Laxman Jhula",
                "title": "The Beatles Chaurasi Kutia Ashram Graffiti & Forest Meditation Walk",
                "description": "Walk amidst stone meditation domes where the Beatles wrote the White Album in 1968, adorned with psychedelic pop murals in Rajaji Tiger Reserve.",
                "category": "culture", "latitude": 30.1145, "longitude": 78.3142, "address": "Beatles Ashram, Swarg Ashram, Rishikesh",
                "price": 150.0, "duration_mins": 75, "is_indoor": False, "is_hidden_gem": True,
                "accessibility_low_walking": True, "accessibility_family_friendly": True, "dietary_vegetarian": True,
                "rating": 4.8, "review_count": 84, "tags": ["beatles", "ashram", "history", "graffiti"],
                "images": ["https://images.unsplash.com/photo-1605649487212-47bdab064df8?w=800"]
            },

            # -------------------------------------------------------------
            # BENGALURU (KARNATAKA) — South
            # -------------------------------------------------------------
            {
                "city": "Bengaluru", "state": "Karnataka", "neighborhood": "Malleshwaram",
                "title": "CTR (Shri Sagar) Crispy Benne Dosa & Filter Kaapi Heritage Breakfast",
                "description": "Savor Bengaluru's legendary golden-brown butter benne dosas served with spicy mint and coconut chutneys, finished with foamy decoction coffee.",
                "category": "food", "latitude": 13.0034, "longitude": 77.5701, "address": "7th Cross, Margosa Road, Malleshwaram, Bengaluru",
                "price": 120.0, "duration_mins": 45, "is_indoor": True, "is_hidden_gem": False,
                "accessibility_low_walking": True, "accessibility_family_friendly": True, "dietary_vegetarian": True,
                "rating": 4.9, "review_count": 210, "tags": ["benne dosa", "filter coffee", "malleshwaram", "tiffin"],
                "images": ["https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800"]
            },
            {
                "city": "Bengaluru", "state": "Karnataka", "neighborhood": "Indiranagar",
                "title": "Indie Microbrewery Craft Beer Flight & Rooftop Botanical Tour",
                "description": "Sample 6 house-brewed beers infused with local spices, kokum, and mango inside an open-air rooftop green oasis.",
                "category": "nightlife", "latitude": 12.9784, "longitude": 77.6408, "address": "100 Feet Road, Indiranagar, Bengaluru",
                "price": 600.0, "duration_mins": 75, "is_indoor": True, "is_hidden_gem": False,
                "accessibility_low_walking": True, "accessibility_family_friendly": False, "dietary_vegetarian": True,
                "rating": 4.8, "review_count": 115, "tags": ["craft beer", "rooftop", "indiranagar", "brewery"],
                "images": ["https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800"]
            },
            {
                "city": "Bengaluru", "state": "Karnataka", "neighborhood": "Cubbon Park",
                "title": "Cubbon Park Bamboo Grove Nature Sketching & Tree Walk",
                "description": "Discover 100+ species of heritage colonial canopy trees and bamboo groves led by a local botanist, with provided charcoal sketching kits.",
                "category": "nature", "latitude": 12.9763, "longitude": 77.5929, "address": "Kasturba Road, Sampangi Rama Nagar, Bengaluru",
                "price": 200.0, "duration_mins": 60, "is_indoor": False, "is_hidden_gem": True,
                "accessibility_low_walking": True, "accessibility_family_friendly": True, "dietary_vegetarian": True,
                "rating": 4.8, "review_count": 64, "tags": ["trees", "botanical", "cubbon park", "nature"],
                "images": ["https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800"]
            },

            # -------------------------------------------------------------
            # KOLKATA (WEST BENGAL) — East
            # -------------------------------------------------------------
            {
                "city": "Kolkata", "state": "West Bengal", "neighborhood": "Kumartuli",
                "title": "Kumartuli Clay Idol Sculptor Enclave & Ganges Straw Sculpting Demo",
                "description": "Walk among hundreds of traditional clay artisans shaping monumental idols of Durga using holy river silt and bamboo straw frameworks.",
                "category": "culture", "latitude": 22.5988, "longitude": 88.3688, "address": "Kumartuli, Banamali Sarkar Street, North Kolkata",
                "price": 200.0, "duration_mins": 75, "is_indoor": False, "is_hidden_gem": True,
                "accessibility_low_walking": True, "accessibility_family_friendly": True, "dietary_vegetarian": True,
                "rating": 4.9, "review_count": 128, "tags": ["sculpture", "clay idols", "kumartuli", "heritage"],
                "images": ["https://images.unsplash.com/photo-1558431382-27e303142255?w=800"]
            },
            {
                "city": "Kolkata", "state": "West Bengal", "neighborhood": "College Street",
                "title": "College Street Boi-Para Book Bazaar & Indian Coffee House Mutton Cutlet",
                "description": "Browse the world's largest second-hand book market with over 1.5 miles of wooden stalls, ending with adda over coffee in high-ceiling halls.",
                "category": "hidden_gem", "latitude": 22.5744, "longitude": 88.3629, "address": "College Street, Central Kolkata",
                "price": 150.0, "duration_mins": 60, "is_indoor": True, "is_hidden_gem": True,
                "accessibility_low_walking": True, "accessibility_family_friendly": True, "dietary_vegetarian": False,
                "rating": 4.9, "review_count": 98, "tags": ["books", "coffee house", "intellectual adda", "vintage"],
                "images": ["https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800"]
            },
            {
                "city": "Kolkata", "state": "West Bengal", "neighborhood": "Park Street",
                "title": "Nizam's Kathi Roll Origin Tasting & Flurys Afternoon Tea Pastry",
                "description": "Bite into the original flaky paratha Kathi roll at Nizam's where it was invented in 1932, followed by vintage rum balls at Flurys.",
                "category": "food", "latitude": 22.5534, "longitude": 88.3512, "address": "New Market / Park Street, Kolkata",
                "price": 300.0, "duration_mins": 60, "is_indoor": True, "is_hidden_gem": False,
                "accessibility_low_walking": True, "accessibility_family_friendly": True, "dietary_vegetarian": False,
                "rating": 4.8, "review_count": 150, "tags": ["kathi roll", "street food", "pastry", "flurys"],
                "images": ["https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800"]
            },

            # -------------------------------------------------------------
            # SHILLONG (MEGHALAYA) — Northeast
            # -------------------------------------------------------------
            {
                "city": "Shillong", "state": "Meghalaya", "neighborhood": "Laitlum Canyons",
                "title": "Laitlum 'End of the World' Canyon Ridge Trek & Khasi Cloud Picnic",
                "description": "Perch atop breathtaking 3,000ft gorges overlooking misty Khasi river valleys and enjoy hot indigenous sticky rice cakes with ginger tea.",
                "category": "adventure", "latitude": 25.4855, "longitude": 91.9544, "address": "Laitlum Gorges, East Khasi Hills, Meghalaya",
                "price": 400.0, "duration_mins": 120, "is_indoor": False, "is_hidden_gem": True,
                "accessibility_low_walking": False, "accessibility_family_friendly": True, "dietary_vegetarian": True,
                "rating": 4.9, "review_count": 86, "tags": ["canyon", "trek", "clouds", "khasi hills"],
                "images": ["https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800"]
            },
            {
                "city": "Shillong", "state": "Meghalaya", "neighborhood": "Police Bazar",
                "title": "Khasi Indigenous Bamboo Basketry & Traditional Ja-Dai Culinary Trail",
                "description": "Learn intricate cane weaving techniques from matriarchal Khasi artisans, followed by traditional steamed pork or bamboo shoot platters.",
                "category": "workshop", "latitude": 25.5788, "longitude": 91.8833, "address": "Lewduh Bara Bazar, Shillong",
                "price": 300.0, "duration_mins": 75, "is_indoor": True, "is_hidden_gem": True,
                "accessibility_low_walking": True, "accessibility_family_friendly": True, "dietary_vegetarian": False,
                "rating": 4.8, "review_count": 52, "tags": ["bamboo craft", "khasi cuisine", "market", "indigenous"],
                "images": ["https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800"]
            }
        ]

        # Add all experiences to DB
        created_exps = []
        for e in experiences_catalog:
            city_obj = city_objects.get(e["city"])
            state_obj = state_objects.get(e["state"])
            
            exp = Experience(
                provider_id=provider_obj.id,
                state_id=state_obj.id if state_obj else None,
                city_id=city_obj.id if city_obj else None,
                title=e["title"],
                description=e["description"],
                category=e["category"],
                country="India",
                state=e["state"],
                city=e["city"],
                neighborhood=e["neighborhood"],
                latitude=e["latitude"],
                longitude=e["longitude"],
                address=e["address"],
                price=e["price"],
                duration_mins=e["duration_mins"],
                is_indoor=e["is_indoor"],
                is_hidden_gem=e["is_hidden_gem"],
                accessibility_low_walking=e["accessibility_low_walking"],
                accessibility_wheelchair=e.get("accessibility_low_walking", False),
                accessibility_step_free=e.get("accessibility_low_walking", False),
                accessibility_family_friendly=e["accessibility_family_friendly"],
                accessibility_senior_friendly=e["accessibility_low_walking"],
                dietary_vegetarian=e["dietary_vegetarian"],
                rating=e["rating"],
                review_count=e["review_count"],
                popularity_score=round(random.uniform(0.85, 0.98), 2),
                tags=e["tags"],
                images=e["images"],
                target_audience=["family", "couples", "solo"],
                is_verified=True,
                is_active=True
            )
            db.add(exp)
            created_exps.append(exp)

        # Generate additional procedural realistic local experiences across remaining destinations to reach 200+
        cities_for_generation = [
            ("Mumbai", "Maharashtra", 19.0760, 72.8777, ["Colaba", "Bandra", "Juhu", "Kala Ghoda", "Versova", "Worli", "Dadar", "Fort"]),
            ("Jaipur", "Rajasthan", 26.9124, 75.7873, ["Walled City", "Johari Bazaar", "Amer", "MI Road", "C-Scheme", "Sanganer", "Bapu Bazaar"]),
            ("Goa", "Goa", 15.4909, 73.8278, ["Fontainhas", "Anjuna", "Palolem", "Divar Island", "Assagao", "Mapusa", "Calangute", "Panaji"]),
            ("Kochi", "Kerala", 9.9312, 76.2673, ["Fort Kochi", "Mattancherry", "Jew Town", "Kumbalangi", "Marine Drive", "Ernakulam"]),
            ("Delhi", "Delhi", 28.6139, 77.2090, ["Old Delhi", "Chandni Chowk", "Hauz Khas", "Nizamuddin", "Lodhi Colony", "Mehrauli", "Connaught Place"]),
            ("Varanasi", "Uttar Pradesh", 25.3176, 82.9739, ["Assi Ghat", "Dashashwamedh Ghat", "Kashi Vishwanath Lanes", "Manikarnika", "Sarnath"]),
            ("Rishikesh", "Uttarakhand", 30.0869, 78.2676, ["Tapovan", "Laxman Jhula", "Ram Jhula", "Shivpuri", "Swarg Ashram"]),
            ("Bengaluru", "Karnataka", 12.9716, 77.5946, ["Malleshwaram", "Indiranagar", "Basavanagudi", "Cubbon Park", "Koramangala", "Frazer Town"]),
            ("Kolkata", "West Bengal", 22.5726, 88.3639, ["Kumartuli", "College Street", "Park Street", "Bow Barracks", "Shyambazar", "Ballygunge"]),
            ("Shillong", "Meghalaya", 25.5788, 91.8933, ["Police Bazar", "Laitlum Canyons", "Mawlynnong", "Umiam Lake", "Laban"]),
            ("Udaipur", "Rajasthan", 24.5854, 73.7125, ["Lake Pichola", "Old City Ghats", "Shilpgram", "Fateh Sagar", "Jagdish Chowk"]),
            ("Amritsar", "Punjab", 31.6340, 74.8723, ["Golden Temple Corridor", "Heritage Street", "Katra Ahluwalia", "Ranjit Avenue", "Town Hall"]),
            ("Pune", "Maharashtra", 18.5204, 73.8567, ["FC Road", "Shaniwar Wada", "Koregaon Park", "Camp", "Kothrud", "Sinhagad Foot"]),
            ("Lucknow", "Uttar Pradesh", 26.8467, 80.9462, ["Chowk", "Hazratganj", "Aminabad", "Kaiserbagh", "Husainabad"])
        ]

        templates = [
            ("Traditional Secret Tea Stall & Artisanal Biscuit Tasting", "food", 60.0, 30, True, True, True, ["chai", "bakery", "local spot", "quick bite"], "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800"),
            ("Century-Old Heritage Haveli Courtyard & Folklore Storytelling", "culture", 250.0, 75, True, True, True, ["folklore", "history", "heritage", "storytelling"], "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800"),
            ("Masterclass in Indigenous Clay Pottery & Wheel Throwing", "workshop", 450.0, 90, True, True, True, ["pottery", "craft", "hands-on", "clay"], "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800"),
            ("Sunset Rooftop Acoustic Music & Local Herbal Drink Tasting", "nightlife", 350.0, 60, False, True, True, ["sunset", "acoustic", "music", "rooftop"], "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800"),
            ("Hidden Alleyway Street Photography & Architectural Walk", "hidden_gem", 0.0, 60, False, True, True, ["photography", "architecture", "hidden alleys"], "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=800"),
            ("Direct-From-Weaver Handloom Silk & Textile Workshop", "shopping", 200.0, 60, True, True, True, ["handloom", "weaving", "textiles", "artisan"], "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=800"),
            ("Sunrise Ridge Nature Trail & Bird Sanctuary Walk", "adventure", 150.0, 90, False, True, False, ["sunrise", "nature", "birdwatching", "trail"], "https://images.unsplash.com/photo-1530866495561-507c9faab2ed?w=800"),
            ("Authentic Street Food Safari: Chaat, Kachoris & Regional Delicacies", "food", 220.0, 60, False, False, True, ["street food", "chaat", "culinary", "flavor"], "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800"),
            ("Organic Spice & Botanical Oil Blending Workshop", "workshop", 500.0, 75, True, True, True, ["spices", "herbs", "organic", "blending"], "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800"),
            ("Traditional Community Drum Circle & Classical Rhythm Jam", "events", 100.0, 60, True, True, True, ["music", "drum circle", "tradition", "rhythm"], "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800"),
            ("Local Fisherfolk Coastal Morning Breeze & Harbor Story Trail", "nature", 120.0, 60, False, True, True, ["coastal", "harbor", "morning", "culture"], "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800"),
            ("Ancient Temple Bell Resonance & Evening Ghee Lamp Lighting", "culture", 0.0, 45, True, True, True, ["spiritual", "temple", "peaceful", "evening"], "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800"),
            ("Traditional Wood Block Carving & Natural Dye Printing", "workshop", 400.0, 90, True, True, True, ["block printing", "wood craft", "natural dye", "workshop"], "https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?w=800"),
            ("Authentic Regional Sweets & Melting Milk Confection Tasting", "food", 160.0, 45, True, True, True, ["sweets", "mithai", "dessert", "culinary"], "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=800")
        ]

        for city_name, state_name, base_lat, base_lng, neighborhoods in cities_for_generation:
            city_obj = city_objects.get(city_name)
            state_obj = state_objects.get(state_name)
            
            # Generate rich unique experiences per city covering all categories
            for idx, tmpl in enumerate(templates):
                neigh = neighborhoods[idx % len(neighborhoods)]
                
                # Small realistic coordinate jitter around base lat/lng (within 2-5 km)
                jitter_lat = base_lat + (random.uniform(-0.035, 0.035))
                jitter_lng = base_lng + (random.uniform(-0.035, 0.035))
                
                title = f"{neigh} {tmpl[0]}"
                exp = Experience(
                    provider_id=provider_obj.id,
                    state_id=state_obj.id if state_obj else None,
                    city_id=city_obj.id if city_obj else None,
                    title=title,
                    description=f"Experience the authentic local charm of {neigh}, {city_name}. Guided by traditional practitioners who have preserved this heritage for generations.",
                    category=tmpl[1],
                    country="India",
                    state=state_name,
                    city=city_name,
                    neighborhood=neigh,
                    latitude=round(jitter_lat, 4),
                    longitude=round(jitter_lng, 4),
                    address=f"{neigh} Main Lane, {city_name}, {state_name}",
                    price=tmpl[2],
                    duration_mins=tmpl[3],
                    is_indoor=tmpl[4],
                    is_hidden_gem=tmpl[5],
                    accessibility_low_walking=tmpl[6],
                    accessibility_wheelchair=tmpl[6],
                    accessibility_step_free=tmpl[6],
                    accessibility_family_friendly=True,
                    accessibility_senior_friendly=tmpl[6],
                    dietary_vegetarian=True,
                    rating=round(random.uniform(4.7, 5.0), 1),
                    review_count=random.randint(25, 180),
                    popularity_score=round(random.uniform(0.80, 0.98), 2),
                    tags=tmpl[7] + [city_name.lower(), neigh.lower()],
                    images=[tmpl[8]],
                    target_audience=["family", "couples", "solo"],
                    is_verified=True,
                    is_active=True
                )
                db.add(exp)
                created_exps.append(exp)

        db.commit()

        # =========================================================================
        # 5. SEED SAMPLE REVIEWS & PROVIDER ANALYTICS
        # =========================================================================
        print("🌱 Seeding Reviews & Real-Time Provider Analytics...")
        for exp in created_exps[:25]:
            rev = Review(
                experience_id=exp.id,
                user_id=traveler_user.id,
                rating=5.0,
                comment=f"Incredible experience in {exp.neighborhood}, {exp.city}! Authentic, relaxed pace and our family loved every minute of it.",
                traveler_type="Family"
            )
            db.add(rev)

            # Analytics data
            an = ProviderAnalytics(
                provider_id=provider_obj.id,
                experience_id=exp.id,
                views=random.randint(180, 650),
                saves=random.randint(40, 120),
                bookings=random.randint(15, 65),
                revenue=float(random.randint(8000, 35000))
            )
            db.add(an)

        db.commit()

        total_exps = db.query(Experience).count()
        total_cities = db.query(City).count()
        total_states = db.query(State).count()

        print("=" * 60)
        print(f"🎉 SEEDING COMPLETE!")
        print(f"📍 Total States & UTs: {total_states}")
        print(f"🏙️ Total Cities: {total_cities}")
        print(f"✨ Total Curated Experiences across India: {total_exps}")
        print(f"👤 Demo Accounts:")
        print(f"   - Traveler: aarav@lokiva.com / traveler123 (City: Mumbai)")
        print(f"   - Provider: provider@lokiva.com / provider123")
        print(f"   - Admin:    admin@lokiva.com / admin123")
        print("=" * 60)

    except Exception as e:
        db.rollback()
        print(f"❌ Seeding error: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
