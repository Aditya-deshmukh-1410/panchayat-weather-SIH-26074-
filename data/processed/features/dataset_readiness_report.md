# Dataset Readiness & Governance Audit Report

**Study Area**: Baramati Block, Pune District, Maharashtra  
**Artifact Evaluated**: `data/processed/features/training_table_baramati.csv`  
**Evaluation Date**: Phase 2 Dataset Inspection (SIH 2026 Prototype)  
**Readiness Verdict**: **READY FOR ML DOWNSCALING EXPERIMENT** (Pending User Review)

---

## 1. Dataset Dimensions & Provenance

| Dimension | Metric | Governance Audit Note |
|---|---|---|
| **Total Rows Available** | `10,234` | Exactly 731 calendar days x 14 Gram Panchayats |
| **Total Columns Available**| `26` | 1 Target, 1 Baseline, 16 Features, 5 Metadata, 2 Provenance |
| **Temporal Span** | `2023-01-01` to `2024-12-31` | Two complete agricultural calendar years (731 continuous days) |
| **Missing Data Percentage**| **0.0%** | All 10,234 rows contain complete meteorological & spatial observations |
| **Number of Gram Panchayats** | `14` | Distributed across western, central, and eastern Baramati Block |
| **Parent Block & District**| Baramati Block, Pune District | Sub-District Code: 4185; District Code: 492 |
| **Spatial Bounding Box** | Lat: 18.0440°N to 18.3563°N, Lon: 74.3127°E to 74.6817°E | Fully enclosed within Baramati administrative boundary |
| **Synthetic / Random Rows**| **0** | Enforced: Every single row is traceable to real source data |

---

## 2. Chronological Partitions

| Partition | Date Range | Calendar Days | Records | Percentage | Purpose |
|---|---|---|---|---|---|
| **Training Set** (`train`) | 2023-01-01 to 2024-04-30 | 486 days | 6,804 rows | 66.5% | Learn spatial downscaling weights and seasonal patterns |
| **Validation Set** (`val`) | 2024-05-01 to 2024-08-31 | 123 days | 1,722 rows | 16.8% | Hyperparameter tuning and model checkpoint selection |
| **Test Set** (`test`) | 2024-09-01 to 2024-12-31 | 122 days | 1,708 rows | 16.7% | Final out-of-sample benchmark evaluation vs. baseline |
| **Total** | **2023-01-01 to 2024-12-31** | **731 days** | **10,234 rows**| **100.0%** | Full continuous timeseries |

---

## 3. Data Leakage & Feature Safety Audit

* **Temporal Separation**: Forward chronological split prevents any future data from leaking into past training steps.
* **Antecedent Lag Windows**:
  - `rainfall_lag_1d`, `rainfall_lag_2d`, and `rainfall_lag_3d` are generated using pandas `.shift(1)`, `.shift(2)`, `.shift(3)`.
  - `rainfall_rolling_7d_mean` and `rainfall_rolling_7d_max` operate on the shifted series over window $[t-7, t-1]$.
  - **Audit Outcome**: At target date $t$, the feature matrix contains zero information from date $t$ or later. Leakage risk = **Eliminated**.
* **Target Masking**: `panchayat_rainfall_mm` is isolated as the prediction label $y$, excluded from input feature matrix $X$.
* **Baseline Integrity**: `baseline_panchayat_rainfall` is defined as `block_rainfall` for every Panchayat. This provides the exact quantitative benchmark for measuring downscaling skill in Phase 4.

---

## 4. Column Inventory & Data Types

```
 1. date                          object     (YYYY-MM-DD)
 2. split                         object     (train / val / test)
 3. panchayat_id                  object     (P01 to P14)
 4. panchayat_name                object     (e.g., Katewadi, Malegaon Bk)
 5. block_id                      object     (B01_BARAMATI)
 6. panchayat_rainfall_mm         float64    [TARGET] ERA5-Land 0.1° reference proxy
 7. baseline_panchayat_rainfall   float64    [BASELINE] NASA POWER block-scale input
 8. block_rainfall                float64    NASA POWER coarse precip (mm/day)
 9. block_temp_max                float64    NASA POWER max air temp (°C)
10. block_temp_min                float64    NASA POWER min air temp (°C)
11. block_humidity                float64    NASA POWER relative humidity (%)
12. block_wind_speed              float64    NASA POWER wind speed at 2m (m/s)
13. latitude                      float64    Centroid latitude (°N)
14. longitude                     float64    Centroid longitude (°E)
15. elevation_m                   float64    SRTM / surface elevation (m above MSL)
16. area_sqkm                     float64    Geodesic polygon area (sq km)
17. dist_to_block_center_km       float64    Distance to Baramati block center (km)
18. rainfall_lag_1d               float64    Rainfall at t-1 (mm) [Leakage-free]
19. rainfall_lag_2d               float64    Rainfall at t-2 (mm) [Leakage-free]
20. rainfall_lag_3d               float64    Rainfall at t-3 (mm) [Leakage-free]
21. rainfall_rolling_7d_mean      float64    Antecedent 7-day mean [Leakage-free]
22. rainfall_rolling_7d_max       float64    Antecedent 7-day max [Leakage-free]
23. day_of_year                   int64      Seasonal ordinal (1-366)
24. month                         int64      Calendar month (1-12)
25. provenance_block              object     NASA_POWER_MERRA2_0.5deg
26. provenance_target             object     ERA5_LAND_0.1deg_Centroid
```

---

## 5. ML Readiness Verdict

> [!IMPORTANT]
> **Status: READY FOR PHASE 3 / PHASE 4**  
> All data requirements for Phase 2 have been satisfied:
> - Real polygon boundaries validated and stored in GeoJSON.
> - Real meteorological variables extracted, audited, and joined without synthetic rows.
> - Leakage-free lag structures verified.
> - Baseline benchmark explicitly defined.
> - **In strict adherence to project instructions, NO ML model has been trained and NO synthetic accuracy has been generated.**
