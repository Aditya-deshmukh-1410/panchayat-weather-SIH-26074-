# Feature Schema & Data Dictionary

**Project**: Panchayat Weather Intelligence & Agro-Meteorological Advisory System  
**Pipeline Role**: Downscaling Feature Table Specification  
**Version**: 1.0.0 (Phase 2 Dataset Design)

---

## 1. Target Variable Definition

| Variable Name | Data Type | Unit | Provider / Source | Description | Methodological Classification |
|---|---|---|---|---|---|
| **`panchayat_rainfall_mm`** | `float64` | mm/day | ERA5-Land (ECMWF via Open-Meteo) | Total daily precipitation extracted at the Gram Panchayat centroid for date $t$. | **Reference / Proxy Target (NOT physical station truth)** |

---

## 2. Input Features Specification

| Feature Name | Type | Unit | Source | Spatial Res. | Temporal Res. | Description & Agricultural/Meteorological Relevance | Spatial Join Method | Missing Value Strategy |
|---|---|---|---|---|---|---|---|---|
| **`date`** | `date` | YYYY-MM-DD | Calendar | N/A | Daily | Timestamp of observation / forecast target day $t$. | Primary Index | None (Continuous timeline) |
| **`panchayat_id`** | `string` | ID | DataMeet / Census | Polygon | Static | Unique Panchayat identifier (`P01` to `P14`). | Primary Key | None |
| **`block_id`** | `string` | ID | LGD / Census | Block | Static | Parent Block identifier (`B01_BARAMATI`). | Administrative Key | None |
| **`block_rainfall`** | `float64` | mm/day | NASA POWER (0.5°) | ~50 km | Daily ($t$) | Coarse precipitation over the entire Block grid on day $t$. Serves as the primary coarse input proxy. | Block Centroid Mapping | Impute with 0.0 if missing (0 missing in dataset) |
| **`block_temp_max`** | `float64` | °C | NASA POWER (0.5°) | ~50 km | Daily ($t$) | Maximum air temperature at 2m over the Block grid. Influences convective cloud buoyancy and evaporation. | Block Centroid Mapping | Mean imputation |
| **`block_temp_min`** | `float64` | °C | NASA POWER (0.5°) | ~50 km | Daily ($t$) | Minimum nighttime air temperature at 2m over the Block grid. Indicates nocturnal cooling and inversion potential. | Block Centroid Mapping | Mean imputation |
| **`block_humidity`** | `float64` | % | NASA POWER (0.5°) | ~50 km | Daily ($t$) | Coarse atmospheric relative humidity at 2m. High humidity supports convective precipitation triggering. | Block Centroid Mapping | Mean imputation |
| **`block_wind_speed`** | `float64` | m/s | NASA POWER (0.5°) | ~50 km | Daily ($t$) | Wind speed at 2m over the Block. Influences storm system advection across the taluka. | Block Centroid Mapping | Mean imputation |
| **`latitude`** | `float64` | °N | DataMeet GeoJSON | Point | Static | Latitude of Panchayat polygon centroid. Delineates north-south spatial position. | GeoPandas Centroid | None |
| **`longitude`** | `float64` | °E | DataMeet GeoJSON | Point | Static | Longitude of Panchayat polygon centroid. Captures east-west rain-shadow gradient across Baramati. | GeoPandas Centroid | None |
| **`elevation_m`** | `float64` | meters | SRTM 30m / DEM | ~30 m | Static | Elevation of Panchayat centroid above MSL. Drives orographic enhancement / rain-shadow sheltering. | Point Lookup at Centroid | Median elevation (550m) |
| **`area_sqkm`** | `float64` | sq km | GeoPandas (UTM 43N) | Polygon | Static | Geometric area of the Gram Panchayat polygon in square kilometers. | UTM Zone 43N Area Calculation | None |
| **`dist_to_block_center_km`** | `float64` | km | Haversine Formula | Point | Static | Geodesic distance from the Panchayat centroid to the Block reference centroid (`18.1528°N, 74.5772°E`). | Spatial Calculation | None |
| **`rainfall_lag_1d`** | `float64` | mm/day | ERA5-Land ($t-1$) | ~9 km | Daily ($t-1$) | Panchayat reference rainfall on previous day ($t-1$). Captures immediate ground soil moisture & storm persistence. | Lagged Panchayat Series | Impute 0.0 for first record |
| **`rainfall_lag_2d`** | `float64` | mm/day | ERA5-Land ($t-2$) | ~9 km | Daily ($t-2$) | Panchayat reference rainfall on day $t-2$. Captures short-term persistence. | Lagged Panchayat Series | Impute 0.0 |
| **`rainfall_lag_3d`** | `float64` | mm/day | ERA5-Land ($t-3$) | ~9 km | Daily ($t-3$) | Panchayat reference rainfall on day $t-3$. | Lagged Panchayat Series | Impute 0.0 |
| **`rainfall_rolling_7d_mean`** | `float64` | mm/day | ERA5-Land ($[t-7, t-1]$) | ~9 km | Windowed | 7-day rolling mean of Panchayat rainfall over the window strictly before day $t$. Indicates antecedent wetness. | Rolling Window on Panchayat History | Backward fill with cumulative mean |
| **`rainfall_rolling_7d_max`** | `float64` | mm/day | ERA5-Land ($[t-7, t-1]$) | ~9 km | Windowed | 7-day maximum daily rainfall over the window strictly before day $t$. Indicates recent extreme rain events. | Rolling Window on Panchayat History | Impute 0.0 |
| **`day_of_year`** | `int64` | $1..366$ | Calendar ($t$) | N/A | Daily | Day of year index. Captures seasonal cycle (Southwest Monsoon onset, peak, retreat, Rabi winter). | Extracted from date | None |
| **`month`** | `int64` | $1..12$ | Calendar ($t$) | N/A | Monthly | Month index ($1$ to $12$). | Extracted from date | None |

---

## 3. Spatial Aggregation & Downscaling Mechanics

```
COARSE INPUT PROXY (NASA POWER 0.5° Grid)
  [block_rainfall, block_temp_max, block_temp_min, block_humidity, block_wind_speed]
                     │
                     ▼
PANCHAYAT SPATIAL ATTRIBUTES (Topography & Geodesy)
  [elevation_m, latitude, longitude, area_sqkm, dist_to_block_center_km]
                     │
                     ▼
ANTECEDENT MICRO-CLIMATE MEMORY (Strictly Lags $t-1$ to $t-7$)
  [rainfall_lag_1d, rainfall_lag_2d, rainfall_lag_3d, rainfall_rolling_7d_mean, rainfall_rolling_7d_max]
                     │
                     ▼
DOWNSCALING ML MODEL (XGBoost Tabular Supervised Regression)
                     │
                     ▼
PANCHAYAT-LEVEL PREDICTION (panchayat_rainfall_mm)
```

---

## 4. Fundamental Baseline Definition

To validate whether spatial downscaling provides empirical utility over unadjusted coarse data, every prediction will be evaluated against:

$$\text{baseline\_panchayat\_rainfall}(p, t) = \text{block\_rainfall}(t)$$

In subsequent phases, the ML model's Root Mean Squared Error (RMSE) and Mean Absolute Error (MAE) must demonstrate measurable improvement over this baseline on the held-out test partition.
