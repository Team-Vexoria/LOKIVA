"""
End-to-End Verification Test for Separate Authentication, Role-Specific Dashboards & Permissions
"""
import sys
import requests

BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_traveler_flow():
    print("\n--- 1. Testing Traveler Authentication & Permissions ---")
    resp = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "traveler@lokiva.demo",
        "password": "traveler123",
        "role": "traveler"
    })
    assert resp.status_code == 200, f"Traveler login failed: {resp.text}"
    data = resp.json()
    token = data["access_token"]
    user = data["user"]
    assert user["role"] == "traveler", f"Expected role 'traveler', got {user['role']}"
    print(f"[OK] Traveler logged in successfully as '{user['full_name']}' (Role: {user['role']})")

    # Traveler accessing public/traveler experiences
    headers = {"Authorization": f"Bearer {token}"}
    exp_resp = requests.get(f"{BASE_URL}/experiences?limit=5", headers=headers)
    assert exp_resp.status_code == 200, f"Traveler failed to get experiences: {exp_resp.text}"
    print(f"[OK] Traveler can access experiences catalog ({len(exp_resp.json())} items)")

    # Security check: Traveler CANNOT access Admin stats
    admin_resp = requests.get(f"{BASE_URL}/admin/stats", headers=headers)
    assert admin_resp.status_code == 403, f"Expected 403 for traveler accessing admin stats, got {admin_resp.status_code}"
    print("[OK] Security Enforced: Traveler received 403 Forbidden on /api/v1/admin/stats")

    # Security check: Traveler CANNOT access Provider experiences
    prov_resp = requests.get(f"{BASE_URL}/providers/experiences", headers=headers)
    assert prov_resp.status_code == 403, f"Expected 403 for traveler accessing provider listings, got {prov_resp.status_code}"
    print("[OK] Security Enforced: Traveler received 403 Forbidden on /api/v1/providers/experiences")


def test_provider_flow():
    print("\n--- 2. Testing Provider Authentication & Business Endpoints ---")
    resp = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "provider@lokiva.demo",
        "password": "provider123",
        "role": "provider"
    })
    assert resp.status_code == 200, f"Provider login failed: {resp.text}"
    data = resp.json()
    token = data["access_token"]
    user = data["user"]
    assert user["role"] == "provider", f"Expected role 'provider', got {user['role']}"
    print(f"[OK] Provider logged in successfully as '{user['full_name']}' (Role: {user['role']})")

    headers = {"Authorization": f"Bearer {token}"}
    
    # Provider Profile
    prof_resp = requests.get(f"{BASE_URL}/providers/me", headers=headers)
    assert prof_resp.status_code == 200, f"Provider failed to get profile: {prof_resp.text}"
    prof = prof_resp.json()
    print(f"[OK] Provider Profile: '{prof.get('business_name')}' (Verified: {prof.get('is_verified')})")

    # Provider Analytics
    an_resp = requests.get(f"{BASE_URL}/providers/analytics", headers=headers)
    assert an_resp.status_code == 200, f"Provider failed to get analytics: {an_resp.text}"
    an = an_resp.json()
    print(f"[OK] Provider Analytics: {an.get('views')} views, INR {an.get('revenue')} revenue")

    # Security check: Provider CANNOT access Admin stats
    admin_resp = requests.get(f"{BASE_URL}/admin/stats", headers=headers)
    assert admin_resp.status_code == 403, f"Expected 403 for provider accessing admin stats, got {admin_resp.status_code}"
    print("[OK] Security Enforced: Provider received 403 Forbidden on /api/v1/admin/stats")


def test_admin_flow():
    print("\n--- 3. Testing Admin Authentication & Platform Governance ---")
    resp = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "admin@lokiva.demo",
        "password": "admin123",
        "role": "admin"
    })
    assert resp.status_code == 200, f"Admin login failed: {resp.text}"
    data = resp.json()
    token = data["access_token"]
    user = data["user"]
    assert user["role"] == "admin", f"Expected role 'admin', got {user['role']}"
    print(f"[OK] Admin authenticated successfully as '{user['full_name']}' (Role: {user['role']})")

    headers = {"Authorization": f"Bearer {token}"}

    # Admin Stats
    stats_resp = requests.get(f"{BASE_URL}/admin/stats", headers=headers)
    assert stats_resp.status_code == 200, f"Admin failed to get stats: {stats_resp.text}"
    st = stats_resp.json()
    print(f"[OK] Admin Stats: {st.get('total_experiences')} experiences, {st.get('total_travelers')} travelers, INR {st.get('demo_revenue')} GMV")

    # Admin Provider List
    provs_resp = requests.get(f"{BASE_URL}/admin/providers", headers=headers)
    assert provs_resp.status_code == 200, f"Admin failed to get providers list: {provs_resp.text}"
    provs = provs_resp.json()
    print(f"[OK] Admin Provider Queue: {len(provs)} providers under management")

    # Admin Provider Verification Toggle
    if len(provs) > 0:
        target_id = provs[0]["id"]
        v_resp = requests.put(f"{BASE_URL}/admin/providers/{target_id}/verify", json={"is_verified": True}, headers=headers)
        assert v_resp.status_code == 200, f"Admin verify failed: {v_resp.text}"
        print(f"[OK] Admin successfully verified provider #{target_id}")


if __name__ == "__main__":
    print("==================================================")
    print(" LOKIVA: End-to-End Persona & Security Test Suite ")
    print("==================================================")
    try:
        test_traveler_flow()
        test_provider_flow()
        test_admin_flow()
        print("\n*** ALL PERSONA AUTHENTICATION & SECURITY TESTS PASSED PERFECTLY! ***\n")
    except Exception as e:
        print(f"\nTEST FAILED: {e}")
        sys.exit(1)
