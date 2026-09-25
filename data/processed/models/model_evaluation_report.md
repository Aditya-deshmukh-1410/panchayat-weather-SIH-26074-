# Quantitative Model Evaluation Report: Block-to-Panchayat Precipitation Downscaling

**Study Region**: Baramati Block, Pune District, Maharashtra (14 Gram Panchayats)  
**Analysis Date**: Phase 3 Execution  
**Model Architecture**: XGBoost Regressor (`XGBRegressor`) vs. Spatial Persistence Baseline  
**Target Reference**: ERA5-Land 0.1° (~9 km) Hourly-Aggregated Daily Precipitation (Reference Proxy)  
**Coarse Input**: NASA POWER 0.5° (~50 km) MERRA-2 Daily Precipitation & Meteorology (Input Proxy)  

---

## 1. Verified Chronological Partitions

Data splitting strictly adheres to chronological non-shuffled partitions to reflect real-world operational forecasting conditions:

| Partition | Start Date | End Date | Calendar Days | Panchayat Count | Observation Count | Fraction of Dataset |
|---|---|---|---|---|---|---|
| **Training (`train`)** | `2023-01-01` | `2024-04-30` | 486 days | 14 | **6,804** | 66.48% |
| **Validation (`val`)** | `2024-05-01` | `2024-08-31` | 123 days | 14 | **1,722** | 16.83% |
| **Test (`test`)** | `2024-09-01` | `2024-12-31` | 122 days | 14 | **1,708** | 16.69% |
| **Complete Dataset** | **2023-01-01** | **2024-12-31** | **731 days** | **14** | **10,234** | **100.0%** |

* **Discrepancy Check**: Observed dates and row counts strictly match the documented Phase 2 definitions (0 discrepancies).
* **Primary Key Verification**: `(date, panchayat_id)` is confirmed unique across all 10,234 records with zero duplicate rows and zero missing values.

---

## 2. Approved 17-Feature Schema & Leakage Audit

The feature matrix $X$ utilizes **17 non-leaking features**, classified into four distinct domain categories:

```json
[
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
```

### Leakage Audit Findings
1. **Zero Same-Day Target Information**: All antecedent historical features (`rainfall_lag_1d`, `rainfall_lag_2d`, `rainfall_lag_3d`, `rainfall_rolling_7d_mean`, `rainfall_rolling_7d_max`) were extracted with a mandatory 1-day temporal lag (`shift(1)`). Lags represent information available strictly at $\le t-1$.
2. **Zero Future Meteorological Information**: Block weather inputs represent day $t$ forecast proxies; no future weather information ($t+1$) is accessible to the model.
3. **Static Spatial Features**: Topography, coordinates, area, and block centroid distance are time-invariant geographic properties derived from boundary geometries and DEM.

---

## 3. Modeling Methodology & Hyperparameter Specification

### 3.1 Baseline Model: Spatial Persistence
The baseline represents standard operational practice in the absence of localized downscaling:
$$\hat{y}_{\text{baseline}, p, t} = \text{block\_rainfall}_t$$
Every Panchayat in Baramati is assumed to receive the identical block-scale precipitation value.

### 3.2 Machine Learning Model: XGBoost Regressor
Gradient-boosted decision trees (`XGBRegressor`) trained on the non-shuffled training partition with the following initial reproducible hyperparameters:
- `n_estimators`: 150
- `max_depth`: 4
- `learning_rate`: 0.05
- `subsample`: 0.8
- `colsample_bytree`: 0.8
- `random_state`: 42
- `n_jobs`: -1

*Note: These hyperparameters represent an initial reproducible benchmark and are not claimed to be globally optimal.* Predictions are lower-bounded at $0.0\text{ mm}$ to respect physical non-negativity of precipitation.

---

## 4. Empirical Evaluation Results

Both models were evaluated on the identical validation and held-out test partitions.

### 4.1 Partition-Level Metrics Summary

| Partition | Metric | Spatial Baseline | XGBoost Regressor | Difference ($\Delta$) | Relative Change |
|---|---|---|---|---|---|
| **Validation** (2024-05-01 to 2024-08-31) | **MAE** | 6.4544 mm | 5.1681 mm | -1.2863 mm | -19.93% |
| | **RMSE** | 11.4397 mm | 8.9348 mm | -2.5049 mm | -21.89% |
| | **$R^2$** | -0.2715 | +0.2243 | +0.4958 | — |
| | **Bias (Mean Error)** | +1.5319 mm | -1.5013 mm | -3.0332 mm | — |
| **Test** (2024-09-01 to 2024-12-31) | **MAE** | **2.7045 mm** | **2.4683 mm** | **-0.2362 mm** | **-8.73%** |
| | **RMSE** | **7.9863 mm** | **6.0922 mm** | **-1.8941 mm** | **-23.72%** |
| | **$R^2$** | **-0.1039** | **+0.3576** | **+0.4615** | — |
| | **Bias (Mean Error)** | **-0.5554 mm** | **-0.2213 mm** | **+0.3341 mm** | — |

### 4.2 Primary Observations
- On the held-out test partition, the XGBoost downscaling model achieved an **MAE reduction of 0.2362 mm (8.73% reduction)** and an **RMSE reduction of 1.8941 mm (23.72% reduction)** relative to the spatial baseline.
- The baseline model yielded a negative coefficient of determination ($R^2 = -0.1039$), indicating that applying uniform block rainfall introduces more variance than a simple historical mean predictor. XGBoost achieved a positive $R^2 = 0.3576$.
- Systematic bias on the test partition decreased from $-0.5554\text{ mm}$ (baseline underestimation) to $-0.2213\text{ mm}$ (XGBoost).

---

## 5. Gram Panchayat Diagnostic Metrics

Diagnostic performance across all 14 Gram Panchayats on the held-out test partition (122 dates per Panchayat = 122 observations).  
*(Note: These figures serve as diagnostic error distributions across administrative units. No ranking is applied, and no unit is classified as "best" or "worst".)*

| Panchayat ID | Panchayat Name | Test Observations | Baseline MAE | Baseline RMSE | Baseline Bias | ML MAE | ML RMSE | ML Bias |
|---|---|---|---|---|---|---|---|---|
| `P01` | Baburdi | 122 | 2.7458 mm | 7.9721 mm | -0.3130 mm | 2.2043 mm | 5.4429 mm | -0.2287 mm |
| `P02` | Dorlewadi | 122 | 2.6952 mm | 8.1546 mm | -0.6024 mm | 2.5473 mm | 6.0769 mm | -0.2246 mm |
| `P03` | Gojubavi | 122 | 2.4493 mm | 6.5061 mm | -0.6302 mm | 2.2968 mm | 5.5207 mm | -0.5017 mm |
| `P04` | Gunwadi | 122 | 2.6952 mm | 8.1546 mm | -0.6024 mm | 2.5477 mm | 6.0898 mm | -0.2156 mm |
| `P05` | Hol | 122 | 2.6540 mm | 7.4785 mm | -0.4032 mm | 2.4079 mm | 5.7976 mm | +0.1379 mm |
| `P06` | Katewadi | 122 | 2.7127 mm | 8.3895 mm | -0.4417 mm | 2.4931 mm | 6.2022 mm | -0.1006 mm |
| `P07` | Katphal | 122 | 2.5907 mm | 7.5944 mm | -0.6261 mm | 2.3994 mm | 5.7458 mm | -0.5338 mm |
| `P08` | Khandaj | 122 | 2.7643 mm | 8.1735 mm | -0.7212 mm | 2.5216 mm | 6.5956 mm | -0.2345 mm |
| `P09` | Korhale Bk | 122 | 2.8378 mm | 8.3229 mm | -0.5581 mm | 2.5082 mm | 6.3192 mm | -0.0466 mm |
| `P10` | Malegaon Bk | 122 | 2.7643 mm | 8.1735 mm | -0.7212 mm | 2.5200 mm | 6.6114 mm | -0.2378 mm |
| `P11` | Rui | 122 | 2.7650 mm | 7.6487 mm | -0.6532 mm | 2.5040 mm | 5.8283 mm | -0.4620 mm |
| `P12` | Shirsuphal | 122 | 2.6758 mm | 7.7830 mm | -0.6040 mm | 2.5966 mm | 5.9532 mm | -0.3645 mm |
| `P13` | Songaon | 122 | 2.7127 mm | 8.3895 mm | -0.4417 mm | 2.5031 mm | 6.2358 mm | -0.1157 mm |
| `P14` | Vadgaon Nimbalkar | 122 | 2.7996 mm | 8.8164 mm | -0.4573 mm | 2.5059 mm | 6.7053 mm | +0.0302 mm |

---

## 6. Rainfall Regime Stratification Analysis

Precipitation errors were analyzed across four predefined meteorological intensity thresholds:

1. **Dry / No Rain**: $< 1.0\text{ mm}$
2. **Light Rain**: $1.0\text{ to } < 5.0\text{ mm}$
3. **Moderate Rain**: $5.0\text{ to } < 20.0\text{ mm}$
4. **Heavy Rain**: $\ge 20.0\text{ mm}$

| Regime | Test Records | % of Test Data | Baseline MAE | Baseline RMSE | Baseline Bias | ML MAE | ML RMSE | ML Bias |
|---|---|---|---|---|---|---|---|---|
| **Dry / No Rain** ($<1$ mm) | 1,174 | 68.74% | **0.3727 mm** | **0.9788 mm** | +0.2960 mm | 0.6123 mm | 1.8607 mm | +0.5842 mm |
| **Light Rain** ($1\text{–}<5$ mm) | 228 | 13.35% | **2.7542 mm** | **3.8463 mm** | +1.0904 mm | 3.6567 mm | 5.2999 mm | +2.3291 mm |
| **Moderate Rain** ($5\text{–}<20$ mm) | 214 | 12.53% | 5.4987 mm | 7.9601 mm | -3.2235 mm | **5.0159 mm** | **6.4673 mm** | **-0.0357 mm** |
| **Heavy Rain** ($\ge 20$ mm) | 92 | 5.39% | 25.8370 mm | 31.4298 mm | -9.2935 mm | **17.2809 mm** | **21.8625 mm** | -17.2519 mm |

### Scientific Discussion of Regime Behavior
- **Dry & Light Regimes ($<5$ mm)**: The baseline exhibits lower MAE than XGBoost on zero-rain and light-rain days. The gradient-boosted trees predict small non-zero residual values ($0.3\text{–}0.8\text{ mm}$) on days when actual rainfall is zero, slightly elevating MAE.
- **Moderate Rainfall ($5\text{–}20$ mm)**: XGBoost reduces MAE from $5.50\text{ mm}$ to $5.02\text{ mm}$ and eliminates systematic bias (reducing bias from $-3.22\text{ mm}$ down to $-0.04\text{ mm}$).
- **Heavy Rainfall ($\ge 20$ mm)**: XGBoost yields an **8.56 mm (33.1%) MAE reduction** and a **9.57 mm (30.4%) RMSE reduction** relative to baseline. However, XGBoost shows negative bias ($-17.25\text{ mm}$), under-predicting the most extreme precipitation peaks due to the standard regression shrinkage associated with MSE/RMSE objective functions on right-skewed tails.

---

## 7. Model Attribution (TreeSHAP Analysis)

TreeSHAP values were calculated across all 1,708 test observations to quantify feature contributions.  
*(Important: SHAP values represent statistical model attribution only and do not establish causal physical relationships.)*

| Rank | Feature | Mean Absolute SHAP Value ($\text{mm}$) | Interpretation / Attribution Domain |
|---|---|---|---|
| 1 | `block_rainfall` | 1.5586 mm | Coarse precipitation driver |
| 2 | `block_humidity` | 1.0810 mm | Atmospheric moisture conditioning |
| 3 | `rainfall_lag_1d` | 0.6190 mm | Antecedent localized soil moisture / convective persistence |
| 4 | `day_of_year` | 0.3279 mm | Seasonal monsoon progression |
| 5 | `block_temp_max` | 0.1807 mm | Surface thermal convective forcing |
| 6 | `block_wind_speed`| 0.1731 mm | Low-level moisture advection |
| 7 | `block_temp_min` | 0.1052 mm | Nocturnal radiative cooling |
| 8 | `rainfall_lag_2d` | 0.0998 mm | Multi-day antecedent persistence |
| 9 | `rainfall_lag_3d` | 0.0821 mm | Multi-day antecedent persistence |
| 10 | `rainfall_rolling_7d_mean` | 0.0573 mm | Weekly cumulative wetness |
| 11 | `rainfall_rolling_7d_max` | 0.0474 mm | Weekly peak intensity history |
| 12 | `latitude` | 0.0400 mm | Spatial north-south rainfall gradient |
| 13 | `elevation_m` | 0.0381 mm | Topographic orographic influence |
| 14 | `month` | 0.0358 mm | Monthly climatological index |
| 15 | `longitude` | 0.0343 mm | Spatial east-west rainfall gradient |
| 16 | `dist_to_block_center_km` | 0.0079 mm | Radial geometric offset |
| 17 | `area_sqkm` | 0.0053 mm | Administrative polygon size |

---

## 8. Diagnostic Plot Manifest

The following five diagnostic plots have been generated and saved to `data/processed/models/plots/`:

1. **`actual_vs_baseline_test.png`**: Scatter plot of actual vs. baseline precipitation on the test partition with a 1:1 reference line.
2. **`actual_vs_xgboost_test.png`**: Scatter plot of actual vs. XGBoost downscaled precipitation with a 1:1 calibration reference line.
3. **`residual_distribution.png`**: Histogram comparing the error residual distributions ($\hat{y} - y$) for baseline vs. XGBoost.
4. **`residual_by_panchayat.png`**: Boxplot illustrating residual spreads across each of the 14 Gram Panchayats.
5. **`shap_feature_importance.png`**: Horizontal bar chart of mean absolute SHAP values across all 17 input features.

---

## 9. Scientific Limitations

1. **Reanalysis Reference Proxy**: Ground-truth target precipitation is derived from ERA5-Land (0.1° / ~9 km), which is a reanalysis model product and not direct automatic weather station (AWS) observations.
2. **Coarse Weather Input Proxy**: Block meteorological features are derived from NASA POWER (0.5° MERRA-2) rather than operational ensemble numerical weather predictions (e.g., IMD WRF / GFS).
3. **Tail Under-Prediction**: Like most tree-based regression algorithms minimizing squared error, XGBoost underestimates extreme convective rainfall events ($\ge 50\text{ mm}$).
4. **Study Area Generalizability**: Results are strictly evaluated for the 14 Gram Panchayats in Baramati Block, Pune District, Maharashtra. Spatial transferability to other bioclimatic zones remains unvalidated.

---

## 10. Summary Statement

XGBoost downscaling reduced overall test RMSE by **23.72%** (from $7.99\text{ mm}$ to $6.09\text{ mm}$) and MAE by **8.73%** (from $2.70\text{ mm}$ to $2.47\text{ mm}$) compared to the spatial baseline. Performance gains were concentrated in moderate and heavy rainfall regimes ($>5\text{ mm}$), while the baseline exhibited lower error on dry days ($<1\text{ mm}$).
