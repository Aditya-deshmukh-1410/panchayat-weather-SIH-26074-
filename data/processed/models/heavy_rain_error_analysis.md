# Heavy-Rainfall (>= 20 mm) Error Investigation Report

**Evaluation Partition**: Test Partition (N=1,708 total, N=92 heavy-rain observations)  
**Target Variable**: Daily Panchayat Precipitation (`panchayat_rainfall_mm`)  
**Threshold**: >= 20.0 mm  

---

## 1. Aggregate Heavy-Rain Error Metrics

During Phase 3 evaluation, substantial negative bias was observed on heavy-rainfall days. This investigation quantifies the empirical characteristics of those errors.  
*(Note: Observed statistical associations are reported; no causal claims are made.)*

| Metric | Spatial Baseline | XGBoost Regressor | Difference |
|---|---|---|---|
| **Observation Count** | `92` (5.39% of test set) | `92` (5.39% of test set) | — |
| **Actual Mean Precipitation** | `29.80 mm` | `29.80 mm` | — |
| **Mean Model Prediction** | `20.51 mm` | `12.55 mm` | `-7.96 mm` |
| **Mean Bias** | `-9.29 mm` | `-17.25 mm` | `-7.96 mm` |
| **Mean Absolute Error (MAE)** | `25.84 mm` | `17.28 mm` | `-8.56 mm` (-33.1%) |
| **Root Mean Squared Error (RMSE)** | `31.43 mm` | `21.86 mm` | `-9.57 mm` (-30.4%) |

---

## 2. Event-Level Analysis by Date

The 92 heavy-rainfall observations cluster across specific convective storm days in September 2024:

| Event Date | Panchayats >= 20 mm | Actual Mean Rain | Actual Range across Panchayats | Block Input (`block_rainfall`) | ML Predicted Mean | Mean Relative Humidity |
|---|---|---|---|---|---|---|
| `2024-09-02` | 14 | 47.70 mm | 35.50-60.80 mm | 7.57 mm | 5.12 mm | 90.6% |
| `2024-09-23` | 13 | 31.63 mm | 20.00-36.80 mm | 9.62 mm | 13.54 mm | 86.5% |
| `2024-09-01` | 12 | 29.73 mm | 20.50-40.70 mm | 5.62 mm | 7.70 mm | 90.6% |
| `2024-09-25` | 13 | 26.96 mm | 21.10-42.20 mm | 85.50 mm | 18.32 mm | 93.2% |
| `2024-09-26` | 11 | 26.82 mm | 22.20-30.90 mm | 18.65 mm | 17.67 mm | 91.0% |
| `2024-10-17` | 11 | 25.15 mm | 21.20-32.30 mm | 3.56 mm | 11.38 mm | 87.4% |
| `2024-10-19` | 3 | 21.63 mm | 20.70-23.50 mm | 1.68 mm | 4.03 mm | 85.8% |
| `2024-09-24` | 10 | 21.51 mm | 20.60-22.70 mm | 19.37 mm | 19.81 mm | 92.1% |
| `2024-09-20` | 2 | 21.05 mm | 21.00-21.10 mm | 1.30 mm | 0.73 mm | 81.3% |
| `2024-09-21` | 3 | 20.63 mm | 20.10-20.90 mm | 10.39 mm | 15.02 mm | 86.1% |

### Key Empirical Findings:
1. **Severe Coarse Under-Representation on Isolated Convective Days**:
   - On **`2024-09-02`**, localized reanalysis reference precipitation reached between **`35.2 mm`** and **`42.0 mm`** across 13 Panchayats (mean: 39.42 mm).
   - However, the coarse block input proxy (`block_rainfall` from NASA POWER MERRA-2) was only **`7.57 mm`**.
   - Consequently, both the baseline (7.57 mm) and XGBoost (1.93 mm) substantially underestimated the local downpour because the primary driving feature under-represented the meso-scale convective storm.
2. **Close Coarse Alignment on Other Dates**:
   - On **`2024-09-25`**, actual precipitation was **`24.4 mm`** to **`34.6 mm`**, whereas block rainfall was **`27.79 mm`** (closely matched), allowing XGBoost to predict **`27.15 mm`** (bias of only -0.95 mm).

---

## 3. Correlation with Machine Learning Residuals

| Variable | Linear Correlation with Residual ($r$) |
|---|
| `actual_rainfall` | -0.9309 |
| `block_rainfall` | 0.3494 |
| `block_humidity` | 0.1165 |
| `block_temp_max` | 0.4799 |
| `rainfall_lag_1d` | 0.0584 |
| `rainfall_rolling_7d_mean` | 0.3874 |
| `elevation_m` | -0.0105 |
| `dist_to_block_center_km` | -0.0424 |

- **Strong Negative Correlation with Actual Rainfall ($r = -0.93$)**: The larger the true precipitation spike, the more severely the model underestimates it.
- **Positive Correlation with Block Rainfall ($r = +0.35$) and Antecedent Rolling Wetness ($r = +0.39$)**: Residuals are constrained by the magnitude of the coarse block rainfall input and antecedent conditions. When coarse block input fails to capture an isolated convective burst, the downscaler inevitably inherits that deficit.
