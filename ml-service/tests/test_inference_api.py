"""
test_inference_api.py
Automated tests for FastAPI Model Inference Service (Phase 4B).

Test cases:
1. /health returns 200 and operational status
2. /ready returns 200 when model artifacts are loaded
3. valid /predict returns non-negative downscaled precipitation
4. valid /predict-with-uncertainty returns valid conformal intervals
5. missing feature returns 422 validation error
6. invalid numeric value returns 422 validation error
7. NaN/infinity is rejected with 422 validation error
8. model output is strictly non-negative
9. uncertainty response contains valid lower/upper ordering
10. model version is returned in responses
11. malformed JSON request is rejected with 422
12. model artifact failure produces 503 readiness failure
13. determinism test: repeated requests produce identical output
"""

import pytest
import json
from fastapi.testclient import TestClient
from app.main import app
from app.core.model_state import model_state

# Sample valid payload derived directly from real test record:
# 2024-09-01, Baburdi (P01), Baramati Block
VALID_PAYLOAD = {
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

@pytest.fixture(scope="module")
def client():
    # Force loading of artifacts for testing
    model_state.load_artifacts()
    with TestClient(app) as test_client:
        yield test_client

# Test 1: /health returns 200
def test_health_endpoint(client: TestClient):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "ml-service"

# Test 2: /ready returns 200 when artifacts available
def test_ready_endpoint(client: TestClient):
    response = client.get("/ready")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ready"
    assert data["model_loaded"] is True
    assert data["metadata_loaded"] is True
    assert data["uncertainty_calibration_loaded"] is True
    assert data["feature_count"] == 17

# Test 3: valid /predict returns prediction
def test_valid_predict(client: TestClient):
    response = client.post("/predict", json=VALID_PAYLOAD)
    assert response.status_code == 200
    data = response.json()
    assert "prediction_mm" in data
    assert isinstance(data["prediction_mm"], (int, float))
    assert data["prediction_mm"] >= 0.0
    assert data["target"] == "daily_precipitation_mm"
    assert data["reference_type"] == "ERA5-Land_reference_proxy"

# Test 4: valid /predict-with-uncertainty returns intervals
def test_valid_predict_with_uncertainty(client: TestClient):
    response = client.post("/predict-with-uncertainty", json=VALID_PAYLOAD)
    assert response.status_code == 200
    data = response.json()
    assert "prediction_mm" in data
    assert "lower_bound_80_mm" in data
    assert "upper_bound_80_mm" in data
    assert "lower_bound_90_mm" in data
    assert "upper_bound_90_mm" in data
    assert data["uncertainty_method"] == "split_conformal_prediction"

# Test 5: missing feature returns validation error
def test_missing_feature(client: TestClient):
    incomplete_payload = VALID_PAYLOAD.copy()
    del incomplete_payload["block_rainfall"]
    response = client.post("/predict", json=incomplete_payload)
    assert response.status_code == 422

# Test 6: invalid numeric value returns validation error
def test_invalid_numeric_range(client: TestClient):
    invalid_payload = VALID_PAYLOAD.copy()
    invalid_payload["block_humidity"] = 150.0  # Humidity cannot exceed 100%
    response = client.post("/predict", json=invalid_payload)
    assert response.status_code == 422

# Test 7: NaN/infinity is rejected
def test_nan_rejected(client: TestClient):
    nan_payload = VALID_PAYLOAD.copy()
    nan_payload["block_rainfall"] = "NaN"
    response = client.post("/predict", json=nan_payload)
    assert response.status_code == 422

def test_infinity_rejected(client: TestClient):
    inf_payload = VALID_PAYLOAD.copy()
    inf_payload["block_rainfall"] = "Infinity"
    response = client.post("/predict", json=inf_payload)
    assert response.status_code == 422

# Test 8: model output is non-negative
def test_non_negative_output(client: TestClient):
    # Test with zero rainfall inputs to ensure non-negative clamp
    zero_payload = VALID_PAYLOAD.copy()
    zero_payload["block_rainfall"] = 0.0
    zero_payload["rainfall_lag_1d"] = 0.0
    zero_payload["rainfall_lag_2d"] = 0.0
    zero_payload["rainfall_lag_3d"] = 0.0
    zero_payload["rainfall_rolling_7d_mean"] = 0.0
    zero_payload["rainfall_rolling_7d_max"] = 0.0
    response = client.post("/predict", json=zero_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["prediction_mm"] >= 0.0

# Test 9: uncertainty response contains valid lower/upper ordering
def test_uncertainty_bounds_ordering(client: TestClient):
    response = client.post("/predict-with-uncertainty", json=VALID_PAYLOAD)
    assert response.status_code == 200
    data = response.json()
    pred = data["prediction_mm"]
    l80 = data["lower_bound_80_mm"]
    u80 = data["upper_bound_80_mm"]
    l90 = data["lower_bound_90_mm"]
    u90 = data["upper_bound_90_mm"]

    assert 0.0 <= l80 <= pred <= u80
    assert 0.0 <= l90 <= pred <= u90
    # 90% interval must be at least as wide as 80% interval
    assert l90 <= l80
    assert u90 >= u80
    assert data["interval_width_90_mm"] >= data["interval_width_80_mm"]

# Test 10: model version is returned
def test_model_version_returned(client: TestClient):
    response = client.post("/predict", json=VALID_PAYLOAD)
    assert response.status_code == 200
    data = response.json()
    assert "model_version" in data
    assert len(data["model_version"]) > 0

# Test 11: malformed JSON is rejected
def test_malformed_json(client: TestClient):
    response = client.post(
        "/predict",
        content="{invalid_json: true,",
        headers={"Content-Type": "application/json"}
    )
    assert response.status_code == 422

# Test 12: model artifact failure produces a clear readiness failure
def test_readiness_failure_handling(client: TestClient):
    # Temporarily set model_state.is_ready to False
    original_ready = model_state.is_ready
    original_error = model_state.error_message
    try:
        model_state.is_ready = False
        model_state.error_message = "Simulated missing artifact for readiness test."
        response = client.get("/ready")
        assert response.status_code == 503
        detail = response.json()["detail"]
        assert detail["status"] == "not_ready"
        assert "Simulated missing artifact" in detail["error"]
    finally:
        model_state.is_ready = original_ready
        model_state.error_message = original_error

# Test 13: determinism test
def test_prediction_determinism(client: TestClient):
    preds = []
    for _ in range(5):
        resp = client.post("/predict", json=VALID_PAYLOAD)
        assert resp.status_code == 200
        preds.append(resp.json()["prediction_mm"])
    
    # All 5 predictions must be strictly identical
    assert all(p == preds[0] for p in preds)
