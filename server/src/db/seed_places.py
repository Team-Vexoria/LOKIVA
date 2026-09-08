import sqlite3
import json
import random

# City data with Unsplash image URLs for each city
CITIES = {
    "Mumbai": {
        "state": "Maharashtra",
        "state_code": "MH",
        "lat": 19.0760,
        "lng": 72.8777,
        "tagline": "The City of Dreams & Coastal Alleys",
        "description": "From colonial art deco promenades to bustling street kebab lanes and fishing villages.",
        "images": [
            "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&q=80",
            "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80",
            "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=800&q=80",
            "https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=800&q=80",
            "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80",
        ]
    },
    "Delhi": {
        "state": "Delhi",
        "state_code": "DL",
        "lat": 28.6139,
        "lng": 77.2090,
        "tagline": "The Imperial Capital of Empires & Chaat",
        "description": "Mughal walled city alleys, Sufi qawwalis, Lodhi garden art walks, and legendary food trails.",
        "images": [
            "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&q=80",
            "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&q=80",
            "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=800&q=80",
            "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800&q=80",
            "https://images.unsplash.com/photo-1558346490-a72e73ae2474?w=800&q=80",
        ]
    },
    "Jaipur": {
        "state": "Rajasthan",
        "state_code": "RJ",
        "lat": 26.9124,
        "lng": 75.7873,
        "tagline": "The Historic Pink City of Crafts & Havelis",
        "description": "Royal palaces, 5th-generation hand block printing, and centuries-old sweet houses.",
        "images": [
            "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&q=80",
            "https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?w=800&q=80",
            "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=800&q=80",
            "https://images.unsplash.com/photo-1549372596-b55ed9a91f94?w=800&q=80",
            "https://images.unsplash.com/photo-1586346381949-7e42603f3135?w=800&q=80",
        ]
    },
    "Goa": {
        "state": "Goa",
        "state_code": "GA",
        "lat": 15.4909,
        "lng": 73.8278,
        "tagline": "Sun-Dappled Latin Quarters & Spice Plantations",
        "description": "Portuguese heritage villas, hidden river islands, artisanal feni tasting, and sunset beaches.",
        "images": [
            "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80",
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
            "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80",
            "https://images.unsplash.com/photo-1542259681-dc5f2752744f?w=800&q=80",
            "https://images.unsplash.com/photo-1593356455510-57d3358af9ec?w=800&q=80",
        ]
    },
    "Bengaluru": {
        "state": "Karnataka",
        "state_code": "KA",
        "lat": 12.9716,
        "lng": 77.5946,
        "tagline": "The Garden City of Microbreweries & Filter Coffee",
        "description": "Heritage tiffin rooms, tree-lined botanical parks, indie music circles, and silk markets.",
        "images": [
            "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800&q=80",
            "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80",
            "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80",
            "https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=800&q=80",
            "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80",
        ]
    },
    "Kochi": {
        "state": "Kerala",
        "state_code": "KL",
        "lat": 9.9312,
        "lng": 76.2673,
        "tagline": "Queen of the Arabian Sea & Spice Route",
        "description": "Chinese fishing nets, historic Jew Town spice warehouses, Kathakali and backwater canoe trails.",
        "images": [
            "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80",
            "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80",
            "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=800&q=80",
            "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&q=80",
            "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80",
        ]
    },
}

# Experience templates for each city with categories
EXPERIENCE_TEMPLATES = {
    "Mumbai": [
        {"title": "Ranwar Village Indo-Portuguese Heritage Walk & Irani Chai", "category": "culture", "price": 350, "duration": 90, "rating": 4.9, "is_hidden_gem": 1},
        {"title": "Aaswad Traditional Maharashtrian Thalipeeth & Kothimbir Vadi Tasting", "category": "food", "price": 180, "duration": 45, "rating": 4.9, "is_hidden_gem": 0},
        {"title": "Kala Ghoda Art Deco Walk & Contemporary Pottery Studio", "category": "workshop", "price": 600, "duration": 90, "rating": 4.8, "is_hidden_gem": 1},
        {"title": "Sassoon Docks Morning Fisherman Action & Secret Sunset Pier", "category": "hidden_gem", "price": 0, "duration": 60, "rating": 4.7, "is_hidden_gem": 1},
        {"title": "Parsi Cafe Trail: Britannia & Co Berry Pulao & Caramel Custard", "category": "food", "price": 450, "duration": 60, "rating": 4.8, "is_hidden_gem": 0},
        {"title": "Kumbharwada Clay Potter Colony Guild Masterclass", "category": "workshop", "price": 250, "duration": 75, "rating": 4.9, "is_hidden_gem": 1},
        {"title": "Queen's Necklace Sunset Breeze & Roasted Bhutta Walk", "category": "nature", "price": 50, "duration": 45, "rating": 4.9, "is_hidden_gem": 0},
        {"title": "Juhu Beach Sunset Stroll & Street Food Safari", "category": "food", "price": 200, "duration": 60, "rating": 4.8, "is_hidden_gem": 0},
        {"title": "Powai Lake Bird Sanctuary & Nature Photography Walk", "category": "nature", "price": 150, "duration": 90, "rating": 4.7, "is_hidden_gem": 1},
        {"title": "Vile Parle Vintage Camera Museum & Film Studio Tour", "category": "culture", "price": 300, "duration": 75, "rating": 4.8, "is_hidden_gem": 1},
        {"title": "Goregaon Film Studio Backlot Walk & Stunt Show", "category": "culture", "price": 400, "duration": 90, "rating": 4.9, "is_hidden_gem": 0},
        {"title": "Malad Natural Park Bamboo Grove Meditation Session", "category": "nature", "price": 100, "duration": 60, "rating": 4.8, "is_hidden_gem": 1},
        {"title": "Andheri Sports Complex Rock Climbing & Bouldering Intro", "category": "adventure", "price": 500, "duration": 90, "rating": 4.7, "is_hidden_gem": 0},
        {"title": "Dadar Social Street Art Walk & Graffiti Masterclass", "category": "culture", "price": 250, "duration": 75, "rating": 4.8, "is_hidden_gem": 1},
        {"title": "Worli Sea Face Midnight Fishing Tour & Moonlit Stroll", "category": "hidden_gem", "price": 350, "duration": 120, "rating": 4.9, "is_hidden_gem": 1},
    ],
    "Delhi": [
        {"title": "Chandni Chowk 7-Stop Heritage Breakfast Trail: Daulat Ki Chaat & Jalebi", "category": "food", "price": 250, "duration": 75, "rating": 4.9, "is_hidden_gem": 0},
        {"title": "Hazrat Nizamuddin Dargah Evening Sufi Qawwali Circle", "category": "culture", "price": 0, "duration": 90, "rating": 4.9, "is_hidden_gem": 1},
        {"title": "Hauz Khas Medieval Madrasa Sunset & Indie Boutique Trail", "category": "hidden_gem", "price": 150, "duration": 60, "rating": 4.8, "is_hidden_gem": 1},
        {"title": "Lodhi Art District Open-Air Street Mural & Botanical Garden Walk", "category": "culture", "price": 0, "duration": 60, "rating": 4.9, "is_hidden_gem": 1},
        {"title": "Connaught Place Heritage Building Architecture Walk", "category": "culture", "price": 200, "duration": 90, "rating": 4.8, "is_hidden_gem": 0},
        {"title": "Karol Bagh Market Hidden Courtyard Jewelers & Silver Craft Tour", "category": "shopping", "price": 350, "duration": 75, "rating": 4.9, "is_hidden_gem": 1},
        {"title": "India Gate Evening Cultural Performance & Street Food Safari", "category": "food", "price": 300, "duration": 90, "rating": 4.7, "is_hidden_gem": 0},
        {"title": "Gulmohar Park Morning Yoga Session & Bird Watching", "category": "nature", "price": 150, "duration": 90, "rating": 4.8, "is_hidden_gem": 0},
        {"title": "Paharganj Backstreet Haveli Heritage Tour & Traditional Henna Art", "category": "culture", "price": 250, "duration": 75, "rating": 4.9, "is_hidden_gem": 1},
        {"title": "Roshanara Garden Mughal Architecture Sunset Photography Walk", "category": "hidden_gem", "price": 100, "duration": 90, "rating": 4.7, "is_hidden_gem": 1},
        {"title": "Mehrauli Archaeological Park Ancient Ruins & Street Art Tour", "category": "culture", "price": 150, "duration": 75, "rating": 4.8, "is_hidden_gem": 1},
        {"title": "Okhla Bird Sanctuary Early Morning Migration Watch", "category": "nature", "price": 200, "duration": 120, "rating": 4.9, "is_hidden_gem": 0},
        {"title": "Sri Niwas Park Hidden Haveli & Rajasthani Puppet Show", "category": "culture", "price": 300, "duration": 60, "rating": 4.8, "is_hidden_gem": 1},
        {"title": "Chatarpur Village Heritage Farm to Table Lunch Experience", "category": "food", "price": 500, "duration": 120, "rating": 4.9, "is_hidden_gem": 0},
        {"title": "Qutub Minar Complex Early Morning Photographic Walk", "category": "hidden_gem", "price": 0, "duration": 90, "rating": 4.7, "is_hidden_gem": 0},
    ],
    "Jaipur": [
        {"title": "Johari Bazaar Gem Cutters Workshop & Precious Stone Tasting", "category": "workshop", "price": 450, "duration": 90, "rating": 4.9, "is_hidden_gem": 1},
        {"title": "Nathdwara Painting Atelier Traditional miniature Painting Masterclass", "category": "workshop", "price": 550, "duration": 120, "rating": 4.8, "is_hidden_gem": 1},
        {"title": "Albert Hall Museum Victorian Architecture & Royal Artifacts Tour", "category": "culture", "price": 250, "duration": 90, "rating": 4.9, "is_hidden_gem": 0},
        {"title": "Jal Mahal Sunset Boat Ride & Lake Bird Watching", "category": "nature", "price": 400, "duration": 90, "duration": 90, "rating": 4.8, "is_hidden_gem": 0},
        {"title": "Amber Fort Night Elephant Ride & Cultural Dinner Under Stars", "category": "culture", "price": 850, "duration": 180, "rating": 4.9, "is_hidden_gem": 0},
        {"title": "Nehru Garden Morning Dance Performance & Rajasthani Thali", "category": "culture", "price": 350, "duration": 90, "rating": 4.8, "is_hidden_gem": 0},
        {"title": "Birla Temple Early Morning Aarti & Peaceful Garden Walk", "category": "spiritual", "price": 0, "duration": 60, "rating": 4.9, "is_hidden_gem": 0},
        {"title": "Sanganer Village Block Printers Workshop & Natural Dye Demo", "category": "workshop", "price": 350, "duration": 90, "rating": 4.8, "is_hidden_gem": 1},
        {"title": "Galta Ji Monkey Temple Sunrise Meditation & Honey Tasting", "category": "spiritual", "price": 200, "duration": 90, "rating": 4.9, "is_hidden_gem": 1},
        {"title": "Jaigarh Fort Cannon Museum & Royal Armory Guided Tour", "category": "culture", "price": 300, "duration": 90, "rating": 4.8, "is_hidden_gem": 0},
        {"title": "Chokhi Dhani Village Cultural Experience with Folk Dance & Dinner", "category": "culture", "price": 650, "duration": 180, "rating": 4.7, "is_hidden_gem": 0},
        {"title": "Moti Dungri Temple Hidden Gardens & Silent Meditation Session", "category": "spiritual", "price": 100, "duration": 60, "rating": 4.8, "is_hidden_gem": 1},
        {"title": "Raja Park Evening Joggers Walk & City Lights Photography", "category": "nature", "price": 0, "duration": 90, "rating": 4.9, "is_hidden_gem": 0},
        {"title": "Bani Thani Painting Masterclass with Traditional Masters", "category": "workshop", "price": 750, "duration": 150, "rating": 4.9, "is_hidden_gem": 1},
        {"title": "Pink City Walk Heritage Buildings & Hidden Courtyards Tour", "category": "culture", "price": 400, "duration": 120, "rating": 4.8, "is_hidden_gem": 0},
    ],
    "Goa": [
        {"title": "Fontainhas Latin Quarter Pastel Houses & Bebinca Workshop", "category": "culture", "price": 400, "duration": 90, "rating": 4.9, "is_hidden_gem": 1},
        {"title": "Divar Island Serene Electric Bicycle River Cruise & Local Feni Tasting", "category": "adventure", "price": 650, "duration": 120, "rating": 4.9, "is_hidden_gem": 1},
        {"title": "Assagao Organic Spice Plantation Farm-to-Table Goan Lunch & Herb Tour", "category": "food", "price": 500, "duration": 90, "rating": 4.8, "is_hidden_gem": 1},
        {"title": "Butterfly Beach Hidden Kayaking & Bioluminescent Sunset Paddle", "category": "adventure", "price": 600, "duration": 105, "rating": 4.9, "is_hidden_gem": 1},
        {"title": "Chapora Fort Sunset Photography & Local Cashew Feni Tasting", "category": "hidden_gem", "price": 350, "duration": 90, "rating": 4.8, "is_hidden_gem": 1},
        {"title": "Canacona Village Fishing Community Morning Boat Ride & Breakfast", "category": "hidden_gem", "price": 300, "duration": 120, "rating": 4.7, "is_hidden_gem": 1},
        {"title": "Salem village Goan Heritage Home Cooking Class & Family Meal", "category": "workshop", "price": 450, "duration": 120, "rating": 4.9, "is_hidden_gem": 1},
        {"title": "Cotigao Wildlife Sanctuary Bird Watching & Canopy Walk", "category": "nature", "price": 250, "duration": 120, "rating": 4.8, "is_hidden_gem": 0},
        {"title": "Mandovi River Cruise Sunset Jazz & Local Wine Tasting", "category": "nightlife", "price": 750, "duration": 120, "rating": 4.9, "is_hidden_gem": 0},
        {"title": "Anjuna Flea Market Hidden Handicrafts & Organic Spice Shopping", "category": "shopping", "price": 0, "duration": 120, "rating": 4.7, "is_hidden_gem": 0},
        {"title": "Aguada Fort Lighthouse Climb & Panoramic Sunset Views", "category": "hidden_gem", "price": 200, "duration": 90, "rating": 4.8, "is_hidden_gem": 0},
        {"title": "Baga Beach Evening Music Festival & Local Cocktail Tasting", "category": "nightlife", "price": 400, "duration": 150, "rating": 4.9, "is_hidden_gem": 0},
        {"title": "Palolem Beach Yoga Session & Bioluminescent Night Swim", "category": "nature", "price": 350, "duration": 120, "rating": 4.8, "is_hidden_gem": 1},
        {"title": "Chinchinim Waterfalls Monsoon Trek & Natural Pool Dipping", "category": "adventure", "price": 200, "duration": 120, "rating": 4.7, "is_hidden_gem": 1},
        {"title": "Sanguem Village Tribal Art Workshop & Traditional Meal", "category": "workshop", "price": 350, "duration": 120, "rating": 4.9, "is_hidden_gem": 1},
    ],
    "Bengaluru": [
        {"title": "CTR (Shri Sagar) Crispy Benne Dosa & Filter Kaapi Heritage Breakfast", "category": "food", "price": 120, "duration": 45, "rating": 4.9, "is_hidden_gem": 0},
        {"title": "Indie Microbrewery Craft Beer Flight & Rooftop Botanical Tour", "category": "nightlife", "price": 600, "duration": 75, "rating": 4.8, "is_hidden_gem": 0},
        {"title": "Cubbon Park Bamboo Grove Nature Sketching & Tree Walk", "category": "nature", "price": 200, "duration": 60, "rating": 4.8, "rating": 4.8, "is_hidden_gem": 1},
        {"title": "Brindavan Garden Musical Fountain Evening Light Show", "category": "hidden_gem", "price": 150, "duration": 90, "rating": 4.7, "is_hidden_gem": 0},
        {"title": "Lalbagh Glass House Rare Orchid Exhibition & Botanical Walk", "category": "nature", "price": 100, "duration": 90, "rating": 4.9, "is_hidden_gem": 0},
        {"title": "ISKCON Temple Early Morning Bhajans &prasada Tasting", "category": "spiritual", "price": 0, "duration": 60, "rating": 4.9, "is_hidden_gem": 0},
        {"title": "Vibrant Canvas Street Art Walk & Mural Painting Workshop", "category": "culture", "price": 350, "duration": 90, "rating": 4.8, "is_hidden_gem": 1},
        {"title": "Bengaluru Club Heritage Architecture & Afternoon Tea Experience", "category": "culture", "price": 450, "duration": 90, "rating": 4.7, "is_hidden_gem": 0},
        {"title": "Commercial Street Hidden Lane Bookstores & Vintage Vinyl Shop Hopping", "category": "shopping", "price": 0, "duration": 120, "rating": 4.8, "is_hidden_gem": 1},
        {"title": "Dakshinayana Yoga Retreat Morning Session & Nature Walk", "category": "nature", "price": 300, "duration": 120, "rating": 4.9, "is_hidden_gem": 1},
        {"title": "Rangayana Theatre Historical Play & Backstage Tour", "category": "culture", "price": 250, "duration": 120, "rating": 4.8, "is_hidden_gem": 0},
        {"title": "Vittal Mallya Garden Early Morning Joggers & Bird Watching", "category": "nature", "price": 0, "duration": 90, "rating": 4.7, "is_hidden_gem": 0},
        {"title": "Bommanahalli Whispering Woods Heritage Walk & Doll Museum", "category": "culture", "price": 150, "duration": 90, "rating": 4.8, "is_hidden_gem": 1},
        {"title": "Nandi Hills Sunrise Trek & Breakfast at viewpoint Resort", "category": "adventure", "price": 500, "duration": 180, "rating": 4.9, "is_hidden_gem": 0},
        {"title": "Malleshwaram Social Community Kitchen Volunteer Experience", "category": "workshop", "price": 0, "duration": 120, "rating": 4.8, "is_hidden_gem": 0},
    ],
    "Kochi": [
        {"title": "Chinese Fishing Nets Mechanics & Fresh Catch Tawa Fry Session", "category": "culture", "price": 300, "duration": 60, "rating": 4.8, "is_hidden_gem": 0},
        {"title": "Jew Town Antique Spice Warehouse Aroma Walk & Ginger Drying Yards", "category": "shopping", "price": 100, "duration": 45, "rating": 4.9, "is_hidden_gem": 1},
        {"title": "Kumbalangi Integrated Village Backwater Canoe Trail & Crab Farming", "category": "nature", "price": 450, "duration": 120, "rating": 4.9, "is_hidden_gem": 1},
        {"title": "Kathakali Green Room Facial Makeup Ritual & Mudra Demo", "category": "culture", "price": 350, "duration": 90, "rating": 4.9, "is_hidden_gem": 0},
        {"title": "Cochin Harbour Terminal Sunset Photography & Port History Tour", "category": "hidden_gem", "price": 250, "duration": 90, "rating": 4.8, "is_hidden_gem": 1},
        {"title": "Mattancherry Palace Dutch Architecture & Murals Walk", "category": "culture", "price": 200, "duration": 75, "rating": 4.7, "is_hidden_gem": 0},
        {"title": "Fort Kochi Street Art Walk & Independent Gallery Hopping", "category": "culture", "price": 150, "duration": 90, "rating": 4.8, "is_hidden_gem": 0},
        {"title": "Backwater Homestay Cooking Class & Banana Leaf Lunch Experience", "category": "workshop", "price": 550, "duration": 150, "rating": 4.9, "is_hidden_gem": 1},
        {"title": "Cherai Beach Natural Sandbar Walk & Sunset Fishing Village Tour", "category": "hidden_gem", "price": 300, "duration": 120, "rating": 4.8, "is_hidden_gem": 1},
        {"title": "Chendamangalam Village Handloom Weaver Cooperative & Bamboo Craft", "category": "workshop", "price": 250, "duration": 90, "rating": 4.7, "is_hidden_gem": 1},
        {"title": "Parur Temple Architecture & Traditional Kathakali Performance", "category": "culture", "price": 300, "duration": 120, "rating": 4.9, "is_hidden_gem": 0},
        {"title": "Vypeen Island Shell Crafting Workshop & Coastal Village Tour", "category": "workshop", "price": 200, "duration": 90, "rating": 4.8, "is_hidden_gem": 1},
        {"title": "Marine Drive Evening Stroll & Local Sunset Coffee at Cafe", "category": "nature", "price": 100, "duration": 60, "rating": 4.9, "is_hidden_gem": 0},
        {"title": "Chettinadu Mansion Architecture & Heritage Meal Experience", "category": "culture", "price": 450, "duration": 120, "rating": 4.7, "is_hidden_gem": 1},
        {"title": "Kochi Backwater Night Cruise with Traditional晚餐 Performance", "category": "nightlife", "price": 650, "duration": 180, "rating": 4.8, "is_hidden_gem": 0},
    ],
}

# Map for category-specific image URLs
CATEGORY_IMAGES = {
    "culture": [
        "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=800&q=80",
        "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&q=80",
        "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&q=80",
    ],
    "food": [
        "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=80",
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
        "https://images.unsplash.com/photo-1506354666285-419918016548?w=800&q=80",
    ],
    "workshop": [
        "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=80",
        "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=800&q=80",
        "https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=800&q=80",
    ],
    "nature": [
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
        "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80",
        "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80",
    ],
    "hidden_gem": [
        "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=800&q=80",
        "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800&q=80",
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80",
    ],
    "adventure": [
        "https://images.unsplash.com/photo-1530866495561-507c9faab2ed?w=800&q=80",
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
        "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80",
    ],
    "spiritual": [
        "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&q=80",
        "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80",
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80",
    ],
    "shopping": [
        "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=80",
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
        "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=800&q=80",
    ],
    "nightlife": [
        "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80",
        "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800&q=80",
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80",
    ],
}


def generate_place_id(city, index):
    """Generate a unique place ID for each city."""
    city_ids = {
        "Mumbai": 100,
        "Delhi": 200,
        "Jaipur": 300,
        "Goa": 400,
        "Bengaluru": 500,
        "Kochi": 600,
    }
    return city_ids[city] + index


def generate_area_id(city, area_name, area_index):
    """Generate area IDs for each neighborhood."""
    city_areas = {
        "Mumbai": 1000,
        "Delhi": 2000,
        "Jaipur": 3000,
        "Goa": 4000,
        "Bengaluru": 5000,
        "Kochi": 6000,
    }
    return city_areas[city] + area_index


def main():
    conn = sqlite3.connect('server/lokiva.sqlite')
    cursor = conn.cursor()

    # Insert cities first if not exists
    for city_name, city_data in CITIES.items():
        # Check if city already exists
        cursor.execute('SELECT id FROM cities WHERE LOWER(name) = LOWER(?)', [city_name])
        if cursor.fetchone():
            continue

        cursor.execute('''
            INSERT INTO cities (name, state_id, state_name, state_code, tagline, description,
                               latitude, longitude, image_url, culture_summary, best_time_to_visit,
                               is_popular, is_heritage_hub, tier)
            VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, 'Tier 1')
        ''', [
            city_name,
            city_data["state"],
            city_data["state_code"],
            city_data["tagline"],
            city_data["description"],
            city_data["lat"],
            city_data["lng"],
            city_data["images"][0],
            f"Explore authentic local culture in {city_name}.",
            "October to March",
        ])
        print(f"Inserted city: {city_name}")

    conn.commit()

    # Insert experiences
    base_experience_id = 3000
    base_area_id = 7000
    experience_count = 0

    for city_name, templates in EXPERIENCE_TEMPLATES.items():
        # Get city info
        cursor.execute('''
            SELECT id, latitude, longitude FROM cities WHERE LOWER(name) = LOWER(?)
        ''', [city_name])
        city_row = cursor.fetchone()
        if not city_row:
            continue

        city_id, city_lat, city_lng = city_row

        for area_index, area in enumerate([
            "Fort Area", "Heritage Zone", "Cultural Quarter", "Arts District",
            "Waterfront", "Garden District", "Market Zone", "Historic Precinct"
        ]):
            area_id = base_area_id + area_index
            cursor.execute('''
                INSERT OR IGNORE INTO areas (city_id, name, character_tag, safety_score, walkability_score, center_lat, center_lng)
                VALUES (?, ?, ?, 4.8, 4.5, ?, ?)
            ''', [city_id, area, "Heritage & Culture", city_lat + 0.001, city_lng + 0.001])

        for idx, tmpl in enumerate(templates):
            area = templates[idx % 8]["title"].split()[0] if len(templates[idx % 8]["title"].split()) > 0 else "Heritage Zone"
            area = area if area in ["Fort", "Heritage", "Cultural", "Arts", "Waterfront", "Garden", "Market", "Historic"] else "Heritage Zone"

            category = tmpl["category"]
            images = CATEGORY_IMAGES.get(category, CATEGORY_IMAGES["culture"])

            cursor.execute('''
                INSERT INTO experiences (
                    provider_id, title, tagline, description, category, cultural_context,
                    state, city, area_name, latitude, longitude, approx_duration_mins, price,
                    currency, max_capacity, difficulty_level, is_indoor, is_rain_safe, is_hidden_gem,
                    is_family_friendly, low_walking, wheelchair_accessible, best_time_of_day,
                    rating, review_count, image_urls, tags, is_active
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
            ''', [
                1,  # provider_id
                tmpl["title"],
                f"Experience authentic local charm in {city_name}",
                f"Guided by traditional practitioners who have preserved this heritage for generations in {city_name}.",
                category,
                f"Traditional {category} experience showcasing {city_name}'s cultural heritage.",
                CITIES[city_name]["state"],
                city_name,
                area,
                city_lat + (idx * 0.001),
                city_lng + (idx * 0.001),
                tmpl["duration"],
                tmpl["price"],
                "INR",
                15,
                "easy",
                tmpl["category"] in ["workshop", "food"],
                1,
                tmpl["is_hidden_gem"],
                1,
                1,
                1,
                "morning" if category == "nature" else "evening",
                tmpl["rating"],
                random.randint(25, 180),
                json.dumps([images[0]]),
                json.dumps([category, city_name.lower(), area.lower()]),
            ])

            experience_count += 1
            if experience_count % 50 == 0:
                print(f"  Inserted {experience_count} experiences for {city_name}...")

        conn.commit()

    # Count final results
    cursor.execute('SELECT COUNT(*) FROM experiences WHERE image_urls != "[]" AND image_urls IS NOT NULL')
    with_images = cursor.fetchone()[0]

    cursor.execute('SELECT COUNT(*) FROM experiences')
    total = cursor.fetchone()[0]

    cursor.execute('SELECT city, COUNT(*) FROM experiences GROUP BY city ORDER BY COUNT(*) DESC')
    city_counts = cursor.fetchall()

    print("\n" + "=" * 60)
    print(f"SEEDING COMPLETE!")
    print(f"Total experiences: {total}")
    print(f"Experiences with images: {with_images}")
    print(f"City breakdown:")
    for city, count in city_counts:
        print(f"  {city}: {count} experiences")
    print("=" * 60)

    conn.close()


if __name__ == "__main__":
    main()
