"""
test_live_inference.py
Executes live HTTP requests against the running FastAPI service on port 8000.
Tests:
- GET /health
- GET /ready
- POST /predict
- POST /predict-with-uncertainty
- Determinism test (5 repeated requests)
- GET /docs and /openapi.json
"""

import requests
import json

BASE_URL = "http://127.0.0.1:8000"

# Documented sample payload derived from real test record:
# Date: 2024-09-01, Panchayat: P01 (Baburdi), Baramati Block
# Provenance: NASA POWER MERRA-2 (0.5°) and ERA5-Land Reanalysis (0.1°)
SAMPLE_PAYLOAD = {
    "block_rainfall": 5.62,
    "block_temp_max": 26.72,
    "block_temp_min": 21.5,
    "block_humidity": 90.61,
    "block_wind_speed": 4.11,
    "latitude": 18.27524,
    "longitude": 74.37465,
    "elevation_m": 598.0,
    "area_sqkm": 13.56,
    "dist_to_block_center_km": 25.36,
    "rainfall_lag_1d": 9.6,
    "rainfall_lag_2d": 1.0,
    "rainfall_lag_3d": 0.5,
    "rainfall_rolling_7d_mean": 4.46,
    "rainfall_rolling_7d_max": 15.8,
    "day_of_year": 245,
    "month": 9
}

def run_tests():
    print(f"[TEST 1] Querying GET {BASE_URL}/health ...")
    r_health = requests.get(f"{BASE_URL}/health", timeout=5)
    print(f"Status: {r_health.status_code}")
    print(json.dumps(r_health.json(), indent=2))
    assert r_health.status_code == 200

    print(f"\n[TEST 2] Querying GET {BASE_URL}/ready ...")
    r_ready = requests.get(f"{BASE_URL}/ready", timeout=5)
    print(f"Status: {r_ready.status_code}")
    print(json.dumps(r_ready.json(), indent=2))
    assert r_ready.status_code == 200

    print(f"\n[TEST 3] Querying POST {BASE_URL}/predict ...")
    r_pred = requests.post(f"{BASE_URL}/predict", json=SAMPLE_PAYLOAD, timeout=5)
    print(f"Status: {r_pred.status_code}")
    print(json.dumps(r_pred.json(), indent=2))
    assert r_pred.status_code == 200
    pred_data = r_pred.json()
    assert pred_data["prediction_mm"] >= 0.0

    print(f"\n[TEST 4] Querying POST {BASE_URL}/predict-with-uncertainty ...")
    r_unc = requests.post(f"{BASE_URL}/predict-with-uncertainty", json=SAMPLE_PAYLOAD, timeout=5)
    print(f"Status: {r_unc.status_code}")
    print(json.dumps(r_unc.json(), indent=2))
    assert r_unc.status_code == 200
    unc_data = r_unc.json()
    assert unc_data["lower_bound_80_mm"] <= unc_data["prediction_mm"] <= unc_data["upper_bound_80_mm"]
    assert unc_data["lower_bound_90_mm"] <= unc_data["prediction_mm"] <= unc_data["upper_bound_90_mm"]

    print("\n[TEST 5] Testing Determinism (5 repeated requests)...")
    preds = []
    for i in range(5):
        r = requests.post(f"{BASE_URL}/predict", json=SAMPLE_PAYLOAD, timeout=5)
        preds.append(r.json()["prediction_mm"])
    print(f"Predictions obtained: {preds}")
    assert all(p == preds[0] for p in preds), "Non-deterministic predictions detected!"
    print("Determinism verified: 100% identical outputs.")

    print(f"\n[TEST 6] Querying GET {BASE_URL}/openapi.json ...")
    r_openapi = requests.get(f"{BASE_URL}/openapi.json", timeout=5)
    print(f"Status: {r_openapi.status_code}")
    info = r_openapi.json().get("info", {})
    print(f"OpenAPI Title: {info.get('title')}, Version: {info.get('version')}")
    assert r_openapi.status_code == 200

    print("\n[ALL LIVE INFERENCE TESTS PASSED SUCCESSFULLY!]")

if __name__ == "__main__":
    run_tests()
