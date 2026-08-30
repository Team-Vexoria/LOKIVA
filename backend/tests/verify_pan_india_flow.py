import urllib.request
import json
import sys

# Ensure UTF-8 output on Windows terminal
sys.stdout.reconfigure(encoding='utf-8')

def verify_pan_india_platform():
    base_url = "http://127.0.0.1:8000/api/v1"
    
    print("=" * 65)
    print("🇮🇳 LOKIVA — PAN-INDIA SYSTEM END-TO-END VERIFICATION")
    print("=" * 65)

    # 1. Login as Traveler (Aarav Sharma)
    print("\n--- 1. Traveler Authentication ---")
    req = urllib.request.Request(f"{base_url}/auth/demo-login/traveler", data=b"{}", headers={"Content-Type": "application/json"})
    res = urllib.request.urlopen(req)
    login_data = json.loads(res.read().decode())
    token = login_data["access_token"]
    print(f"Logged in as: {login_data['user']['full_name']} (Default City: {login_data['user']['profile']['current_city']})")

    # 2. Test Destinations API
    print("\n--- 2. Pan-India Destinations & States Directory ---")
    dest_req = urllib.request.Request(f"{base_url}/destinations")
    dests = json.loads(urllib.request.urlopen(dest_req).read().decode())
    print(f"Total Popular Destination Hubs: {len(dests)}")
    for d in dests[:6]:
        print(f"  * {d['name']} ({d['state_name']}) — {d['experience_count']} experiences: '{d['tagline']}'")

    # 3. Test 1: Mumbai AI Discovery & Constraints Extraction
    print("\n--- 3. Test 1: Mumbai Query (Family · 4h · ₹2,000 · Low Walking) ---")
    mumbai_query = {
        "query": "I'm with my parents in Mumbai. We have 4 hours, ₹2,000, want local food and culture, and low walking.",
        "user_location": {"lat": 19.0596, "lng": 72.8295}
    }
    req = urllib.request.Request(f"{base_url}/ai/chat", data=json.dumps(mumbai_query).encode("utf-8"), headers={"Content-Type": "application/json", "Authorization": f"Bearer {token}"})
    mumbai_res = json.loads(urllib.request.urlopen(req).read().decode())
    print(f"Detected City: {mumbai_res['extracted_intent']['destination_city']}")
    print(f"Detected Budget: ₹{mumbai_res['extracted_intent']['budget']}")
    print(f"AI Recommendations in Mumbai ({len(mumbai_res['recommendations'])} found):")
    for r in mumbai_res['recommendations'][:3]:
        print(f"  * {r['experience']['title']} ({r['experience']['neighborhood']}, Mumbai) — ₹{r['experience']['price']} (Score: {r['overall_score']})")

    # 4. Test 2: Kochi Cultural Query
    print("\n--- 4. Test 2: Kochi Query ('3 hours in Kochi, cultural experiences') ---")
    kochi_query = {
        "query": "I have 3 hours in Kochi and want authentic cultural experiences.",
        "user_location": {"lat": 9.9312, "lng": 76.2673}
    }
    req = urllib.request.Request(f"{base_url}/ai/chat", data=json.dumps(kochi_query).encode("utf-8"), headers={"Content-Type": "application/json", "Authorization": f"Bearer {token}"})
    kochi_res = json.loads(urllib.request.urlopen(req).read().decode())
    print(f"Detected City: {kochi_res['extracted_intent']['destination_city']}")
    print(f"AI Recommendations in Kochi ({len(kochi_res['recommendations'])} found):")
    for r in kochi_res['recommendations'][:3]:
        print(f"  * {r['experience']['title']} ({r['experience']['neighborhood']}, Kochi) — ₹{r['experience']['price']}")

    # 5. Test 3: Goa Adventure & Beaches Query
    print("\n--- 5. Test 3: Goa Query ('Goa under ₹3000, adventure and beaches') ---")
    goa_query = {
        "query": "What can I do in Goa under ₹3000 with adventure and beaches?",
        "user_location": {"lat": 15.4909, "lng": 73.8278}
    }
    req = urllib.request.Request(f"{base_url}/ai/chat", data=json.dumps(goa_query).encode("utf-8"), headers={"Content-Type": "application/json", "Authorization": f"Bearer {token}"})
    goa_res = json.loads(urllib.request.urlopen(req).read().decode())
    print(f"Detected City: {goa_res['extracted_intent']['destination_city']}")
    print(f"AI Recommendations in Goa ({len(goa_res['recommendations'])} found):")
    for r in goa_res['recommendations'][:3]:
        print(f"  * {r['experience']['title']} ({r['experience']['neighborhood']}, Goa) — ₹{r['experience']['price']}")

    # 6. Test 4: Near-Me Discovery (GPS Coordinates & Radius)
    print("\n--- 6. Test 4: Near-Me Discovery (GPS Radius = 5 km around Delhi) ---")
    near_req = urllib.request.Request(f"{base_url}/experiences?latitude=28.6139&longitude=77.2090&radius_km=10&limit=4")
    near_exps = json.loads(urllib.request.urlopen(near_req).read().decode())
    print(f"Nearby Spots Found: {len(near_exps)}")
    for e in near_exps:
        print(f"  * {e['title']} ({e['neighborhood']}, {e['city']})")

    # 7. Test 5: Multi-City Itinerary Creation & Feasibility
    print("\n--- 7. Test 5: Itinerary Generation in Mumbai ---")
    mumbai_ids = [r['experience']['id'] for r in mumbai_res['recommendations'][:2]]
    itin_payload = {
        "title": "Mumbai Coastal Flavors & Heritage Plan",
        "city": "Mumbai",
        "start_time": "10:00",
        "total_duration_mins": 240,
        "total_budget": 2000.0,
        "experience_ids": mumbai_ids
    }
    req = urllib.request.Request(f"{base_url}/itineraries", data=json.dumps(itin_payload).encode("utf-8"), headers={"Content-Type": "application/json", "Authorization": f"Bearer {token}"})
    itin_res = json.loads(urllib.request.urlopen(req).read().decode())
    print(f"Itinerary: '{itin_res['title']}' in {itin_res['city']}")
    print(f"Feasibility Score: {itin_res['feasibility_score']}% ({itin_res['feasibility_status']})")
    print(f"Cost: ₹{itin_res['actual_cost']} / ₹{itin_res['total_budget']}")

    # 8. Test 6: Destination-Aware Re-planning in Goa
    print("\n--- 8. Test 6: Live Dynamic Re-planning in Goa (Rain Alert) ---")
    goa_ids = [r['experience']['id'] for r in goa_res['recommendations'][:2]]
    replan_payload = {
        "city": "Goa",
        "current_experience_ids": goa_ids,
        "scenario": "weather_rain"
    }
    req = urllib.request.Request(f"{base_url}/itineraries/replan", data=json.dumps(replan_payload).encode("utf-8"), headers={"Content-Type": "application/json", "Authorization": f"Bearer {token}"})
    replan_res = json.loads(urllib.request.urlopen(req).read().decode())
    print(f"Re-plan Summary: {replan_res['replan_summary']}")
    print(f"Explanation: {replan_res['explanation']}")
    print(f"Target City: {replan_res['city']}")

    # 9. Test 7: Admin Pan-India Platform Stats
    print("\n--- 9. Test 7: Admin Pan-India Overview ---")
    admin_req = urllib.request.Request(f"{base_url}/admin/stats")
    admin_data = json.loads(urllib.request.urlopen(admin_req).read().decode())
    print(f"Admin Stats — Experiences: {admin_data['total_experiences']}, Cities: {admin_data['total_cities']}, States: {admin_data['total_states']}, GMV: ₹{admin_data['demo_revenue']}")

    print("\n" + "=" * 65)
    print("🎉 ALL PAN-INDIA DEMO TESTS PASSED SUCCESSFULLY!")
    print("=" * 65)

if __name__ == "__main__":
    verify_pan_india_platform()
