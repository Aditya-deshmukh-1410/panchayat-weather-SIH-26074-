# FastAPI ML Inference Service: Panchayat Precipitation Downscaling

**Service Identifier**: `ml-service`  
**Framework**: FastAPI 0.110+ / Python 3.11  
**Default Port**: `8000`  
**Model Architecture**: Frozen XGBoost Regressor (`xgb_downscaler.json`, $n=150$, depth$=4$, $\text{lr}=0.05$)  
**Uncertainty Engine**: Inductive Split Conformal Prediction (`uncertainty_calibration.json`)  
**Target Reference**: ERA5-Land 0.1° (~9 km) Hourly-Aggregated Daily Precipitation (Reference Proxy)  

---

## 1. How to Start the Service

### Option A: Local Python Virtual Environment (Active Prototype)
From the repository root:
```bash
cd ml-service
.\venv\Scripts\python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### Option B: Docker Compose
From the repository root:
```bash
docker compose up ml-service
```

Interactive documentation is automatically available at:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **OpenAPI Schema**: `http://localhost:8000/openapi.json`

---

## 2. API Endpoints Specification

### 2.1 `GET /health` (Liveness Probe)
Verifies that the web service process is active. Used by container orchestrators and the NestJS backend dependency check.

**Response (HTTP 200 OK)**:
```json
{
  "status": "ok",
  "service": "ml-service",
  "version": "0.1.0",
  "timestamp": "2026-09-23T10:12:17.391789+00:00",
  "system_info": {
    "python_version": "3.11.9",
    "platform": "Windows",
    "architecture": "AMD64"
  }
}
```

---

### 2.2 `GET /ready` (Readiness Probe)
Verifies that the frozen model, metadata, and split-conformal calibration quantiles are fully initialized in memory. Returns HTTP 503 if artifacts fail to load.

**Response (HTTP 200 OK)**:
```json
{
  "status": "ready",
  "service": "ml-service",
  "model_loaded": true,
  "metadata_loaded": true,
  "uncertainty_calibration_loaded": true,
  "model_version": "v0.1.0-alpha",
  "feature_count": 17,
  "features": [
    "block_rainfall",
    "block_temp_max",
    "block_temp_min",
    "block_humidity",
    "block_wind_speed",
    "latitude",
    "longitude",
    "elevation_m",
    "area_sqkm",
    "dist_to_block_center_km",
    "rainfall_lag_1d",
    "rainfall_lag_2d",
    "rainfall_lag_3d",
    "rainfall_rolling_7d_mean",
    "rainfall_rolling_7d_max",
    "day_of_year",
    "month"
  ]
}
```

---

### 2.3 `POST /predict` (Point Precipitation Downscaling)
Accepts the 17 approved meteorological, spatial, and antecedent lag features. Generates a non-negative precipitation prediction in mm/day.

**Request Payload (`application/json`)**:
*(Sample derived directly from real test record: 2024-09-01, Baburdi P01, Baramati)*
```json
{
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
```

**Response (HTTP 200 OK)**:
```json
{
  "prediction_mm": 8.564,
  "model_version": "v0.1.0-alpha",
  "target": "daily_precipitation_mm",
  "reference_type": "ERA5-Land_reference_proxy"
}
```

---

### 2.4 `POST /predict-with-uncertainty` (Conformal Intervals)
Generates the point prediction along with pre-calibrated 80% and 90% split-conformal prediction intervals.

**Request Payload (`application/json`)**: (Identical to `POST /predict`)

**Response (HTTP 200 OK)**:
```json
{
  "prediction_mm": 8.564,
  "lower_bound_80_mm": 0.3958,
  "upper_bound_80_mm": 16.7322,
  "lower_bound_90_mm": 0.0,
  "upper_bound_90_mm": 21.8821,
  "interval_width_80_mm": 16.3364,
  "interval_width_90_mm": 21.8821,
  "model_version": "v0.1.0-alpha",
  "uncertainty_method": "split_conformal_prediction"
}
```

---

## 3. Approved 17-Feature Schema Specification

All features are strictly required. Unknown/extra properties are rejected with HTTP 422:

| # | Feature Name | Type | Physical Bounds | Unit | Provenance / Role |
|---|---|---|---|---|---|
| 1 | `block_rainfall` | float | $[0.0, 1000.0]$ | mm/day | Coarse block input proxy (NASA POWER) |
| 2 | `block_temp_max` | float | $[-20.0, 65.0]$ | °C | Coarse max surface temperature |
| 3 | `block_temp_min` | float | $[-30.0, 55.0]$ | °C | Coarse min surface temperature |
| 4 | `block_humidity` | float | $[0.0, 100.0]$ | % | Coarse relative humidity |
| 5 | `block_wind_speed`| float | $[0.0, 150.0]$ | m/s | Coarse wind speed at 2m |
| 6 | `latitude` | float | $[-90.0, 90.0]$ | °N | Panchayat centroid latitude |
| 7 | `longitude` | float | $[-180.0, 180.0]$ | °E | Panchayat centroid longitude |
| 8 | `elevation_m` | float | $[-500.0, 9000.0]$| meters | SRTM 30m DEM elevation |
| 9 | `area_sqkm` | float | $(0.0, 10000.0]$ | km² | Census 2011 administrative polygon area |
| 10 | `dist_to_block_center_km` | float | $[0.0, 1000.0]$ | km | Geodesic offset to block center |
| 11 | `rainfall_lag_1d` | float | $[0.0, 1000.0]$ | mm/day | Localized precipitation at day $t-1$ |
| 12 | `rainfall_lag_2d` | float | $[0.0, 1000.0]$ | mm/day | Localized precipitation at day $t-2$ |
| 13 | `rainfall_lag_3d` | float | $[0.0, 1000.0]$ | mm/day | Localized precipitation at day $t-3$ |
| 14 | `rainfall_rolling_7d_mean`| float | $[0.0, 1000.0]$ | mm/day | 7-day antecedent rolling average |
| 15 | `rainfall_rolling_7d_max` | float | $[0.0, 1000.0]$ | mm/day | 7-day antecedent peak intensity |
| 16 | `day_of_year` | int | $[1, 366]$ | day | Ordinal calendar day (seasonality) |
| 17 | `month` | int | $[1, 12]$ | month | Calendar month index |

---

## 4. Uncertainty Methodology & Limitations

1. **Split Conformal Prediction**:
   - Calibrated strictly on the validation partition ($N=1,722$), leaving the evaluation test set completely untouched during calibration.
   - Non-conformity score: $s_i = |y_i - \hat{y}_i|$.
   - Conformal cutoffs: $\hat{q}_{80} = 8.1682\text{ mm}$, $\hat{q}_{90} = 13.3181\text{ mm}$.
   - Lower bounds are clamped at $\ge 0.0\text{ mm}$ to respect physical non-negativity.
2. **Terminology**:
   - These are **conformal prediction intervals**, not heuristic "confidence percentages" or subjective probabilities.
3. **Marginal vs. Conditional Coverage**:
   - Split conformal prediction provides *marginal* coverage guarantees across the population distribution. During extreme tail downpours ($\ge 40\text{ mm}$), intervals may under-cover, while during dry periods they provide safe conservative bounds.

---

## 5. Important Scientific Boundary

```
Current Experiment (Historical Retrospective Downscaling):
NASA POWER 0.5° historical proxy  ──>  Frozen XGBoost  ──>  ERA5-Land 0.1° Reference Proxy

Future Operational Architecture (Not Yet Implemented):
Operational NWP Forecast (WRF/GFS) ──> Feature Pipeline ──> Downscaler ──> Advisory Engine
```

- This microservice executes retrospective spatial downscaling on concurrent meteorological variables.
- It is **NOT** yet coupled to an operational live forecast API (e.g. IMD WRF / GFS).
- The prediction target is ERA5-Land reanalysis reference proxy, **NOT** physical ground rain-gauge measurements.
