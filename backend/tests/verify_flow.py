import urllib.request
import json
import sys

# Ensure UTF-8 output on Windows terminal
sys.stdout.reconfigure(encoding='utf-8')

def verify_complete_demo_flow():
    base_url = "http://127.0.0.1:8000/api/v1"
    
    # 1. Test Demo Login
    print("--- 1. Testing Demo Login (Aarav Sharma) ---")
    req = urllib.request.Request(f"{base_url}/auth/demo-login/traveler", data=b"{}", headers={"Content-Type": "application/json"})
    res = urllib.request.urlopen(req)
    login_data = json.loads(res.read().decode())
    token = login_data["access_token"]
    print(f"Logged in as: {login_data['user']['full_name']} (Role: {login_data['user']['role']})")
    
    # 2. Test Final UX Request Intent Extraction & Recommendations
    print("\n--- 2. Testing AI Local Concierge Request ---")
    query_payload = {
        "query": "I'm with my family near my hotel. We have 3 hours, ₹1,500, want local food and culture, prefer low walking, and don't want touristy places.",
        "user_location": {"lat": 26.9180, "lng": 75.8050}
    }
    req = urllib.request.Request(
        f"{base_url}/ai/chat",
        data=json.dumps(query_payload).encode("utf-8"),
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {token}"}
    )
    res = urllib.request.urlopen(req)
    chat_res = json.loads(res.read().decode())
    print("AI Reply:", chat_res["reply"])
    print("Extracted Intent:", json.dumps(chat_res["extracted_intent"], indent=2))
    print(f"Total Ranked Recommendations Found: {len(chat_res['recommendations'])}")
    for r in chat_res["recommendations"]:
        print(f"  * {r['experience']['title']} (Score: {r['overall_score']}, Price: ₹{r['experience']['price']}, Dist: {r['distance_km']}km)")
        for b in r["why_it_fits"]:
            print(f"      {b}")

    # 3. Test Itinerary Creation & Feasibility
    print("\n--- 3. Testing Feasibility Engine & Itinerary Creation ---")
    top_ids = [r["experience"]["id"] for r in chat_res["recommendations"][:2]]
    itin_payload = {
        "title": "Family Cultural & Food Walk",
        "start_time": "10:00",
        "total_duration_mins": 180,
        "total_budget": 1500.0,
        "experience_ids": top_ids
    }
    req = urllib.request.Request(
        f"{base_url}/itineraries",
        data=json.dumps(itin_payload).encode("utf-8"),
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {token}"}
    )
    res = urllib.request.urlopen(req)
    itin_res = json.loads(res.read().decode())
    print(f"Itinerary Created: '{itin_res['title']}'")
    print(f"Feasibility Score: {itin_res['feasibility_score']}% (Status: {itin_res['feasibility_status']})")
    print(f"Total Cost: ₹{itin_res['actual_cost']} / ₹{itin_res['total_budget']}")
    print(f"Travel Time: {itin_res['travel_time_mins']} mins, Buffer: {itin_res['buffer_time_mins']} mins")
    for item in itin_res["items"]:
        print(f"  * [{item['scheduled_start']} - {item['scheduled_end']}] {item['experience']['title']} (Transit from prev: {item['travel_time_from_prev_mins']}m)")

    # 4. Test Dynamic Re-planning (Rain Alert)
    print("\n--- 4. Testing Dynamic Re-planning (Simulate Rain Alert) ---")
    replan_payload = {
        "itinerary_id": itin_res["id"],
        "current_experience_ids": top_ids,
        "scenario": "weather_rain"
    }
    req = urllib.request.Request(
        f"{base_url}/itineraries/replan",
        data=json.dumps(replan_payload).encode("utf-8"),
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {token}"}
    )
    res = urllib.request.urlopen(req)
    replan_res = json.loads(res.read().decode())
    print("Re-plan Summary:", replan_res["replan_summary"])
    print("Explanation:", replan_res["explanation"])
    print(f"Updated Itinerary Feasibility: {replan_res['itinerary']['feasibility_score']}%")

    # 5. Test Provider Dashboard API
    print("\n--- 5. Testing Provider Analytics API ---")
    prov_req = urllib.request.Request(f"{base_url}/auth/demo-login/provider", data=b"{}", headers={"Content-Type": "application/json"})
    prov_token = json.loads(urllib.request.urlopen(prov_req).read().decode())["access_token"]
    
    an_req = urllib.request.Request(f"{base_url}/providers/analytics", headers={"Authorization": f"Bearer {prov_token}"})
    an_data = json.loads(urllib.request.urlopen(an_req).read().decode())
    print(f"Provider Views: {an_data['views']}, Bookings: {an_data['bookings']}, Revenue: ₹{an_data['revenue']}, Conversion: {an_data['conversion_rate']}%")

    # 6. Test Admin Stats API
    print("\n--- 6. Testing Admin Superuser Stats API ---")
    adm_req = urllib.request.Request(f"{base_url}/admin/stats")
    adm_data = json.loads(urllib.request.urlopen(adm_req).read().decode())
    print(f"Admin Stats — Travelers: {adm_data['total_travelers']}, Providers: {adm_data['total_providers']}, Experiences: {adm_data['total_experiences']}, GMV: ₹{adm_data['demo_revenue']}")

    print("\nALL 6 DEMO PHASES VERIFIED SUCCESSFULLY!")

if __name__ == "__main__":
    verify_complete_demo_flow()
