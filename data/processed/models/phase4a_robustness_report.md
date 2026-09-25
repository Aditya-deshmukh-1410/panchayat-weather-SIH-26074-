# Phase 4A Comprehensive Model Robustness & Uncertainty Report

**Study Area**: Baramati Block, Pune District, Maharashtra (14 Gram Panchayats)  
**Evaluation Scope**: Held-Out Chronological Test Partition (`2024-09-01` to `2024-12-31`, N=1,708)  
**Target Reference**: ERA5-Land Daily Precipitation (0.1 deg Reference Proxy)  
**Baseline Model**: Spatial Persistence (baseline = block_rainfall)  
**ML Model**: Reproducible XGBoost Regressor (`XGBRegressor`, n=150, depth=4, lr=0.05)  

---

## 1. Reproducibility Audit Result

- **Model Loading**: Deterministic reload of `data/processed/models/xgb_downscaler.json`.
- **Feature Dimension**: Exactly 17 approved non-leaking features.
- **Maximum Numerical Discrepancy**: `0.00000095 mm`.
- **Mean Absolute Discrepancy**: `0.00000007 mm`.
- **Mismatches (> 10^-4)**: **`0`** (100% numerical match).

---

## 2. Monthly Test Performance Breakdown

Evaluated strictly across the four held-out test months:

| Month | Observations | Actual Mean Rain | Baseline MAE | Baseline RMSE | Baseline R2 | ML MAE | ML RMSE | ML R2 | MAE Reduction |
|---|---|---|---|---|---|---|---|---|---|
| **September 2024** | 420 | 8.13 mm | 7.2994 mm | 14.9676 mm | -0.5020 | **6.5328 mm** | **11.1209 mm** | 0.1708 | +0.7666 mm |
| **October 2024** | 434 | 4.68 mm | 3.1001 mm | 5.7578 mm | 0.1458 | **2.8609 mm** | **5.0582 mm** | 0.3408 | +0.2392 mm |
| **November 2024** | 420 | 0.08 mm | 0.2010 mm | 0.7021 mm | -4.8248 | **0.2270 mm** | **0.5482 mm** | -2.5508 | -0.0260 mm |
| **December 2024** | 434 | 0.28 mm | 0.2848 mm | 0.7603 mm | -0.1372 | **0.3113 mm** | **0.7110 mm** | 0.0054 | -0.0265 mm |

* **Observation**: In the wet monsoon month (September), XGBoost reduced MAE by **0.77 mm (10.5%)** and RMSE by **3.85 mm (25.7%)**, and in October reduced MAE by **0.24 mm (7.7%)**. In dry winter months (November-December, mean rain < 0.3 mm), the spatial baseline achieved lower error because block rainfall was zero, whereas XGBoost predicted residual background drizzle (0.2-0.3 mm).

---

## 3. Gram Panchayat Robustness Diagnostics

All 14 Panchayats were evaluated on identical test partitions (122 dates each = 122 observations).  
*(Diagnostic statistics only; no ranking or best/worst classification applied)*:

- **Baseline MAE Range**: `2.4493 mm` (Gojubavi) to `2.8378 mm` (Korhale Bk)
- **XGBoost MAE Range**: `2.2043 mm` (Baburdi) to `2.5966 mm` (Shirsuphal)
- **Mean Absolute MAE Improvement across Panchayats**: `0.2362 mm`
- **Panchayat Error Uniformity**: XGBoost error residuals are stable across all 14 administrative units without extreme localized outliers.

---

## 4. Rainfall Regime Diagnostics

| Regime | Test Observations | % of Dataset | Small Sample Flag | Baseline MAE | XGBoost MAE | Baseline Bias | XGBoost Bias |
|---|---|---|---|---|---|---|---|
| **Dry / No Rain** (< 1 mm) | 1,174 | 68.74% | NO | **0.3727 mm** | 0.6123 mm | +0.2960 mm | +0.5842 mm |
| **Light Rain** (1-< 5 mm) | 228 | 13.35% | NO | **2.7542 mm** | 3.6567 mm | +1.0904 mm | +2.3291 mm |
| **Moderate Rain** (5-< 20 mm) | 214 | 12.53% | NO | 5.4987 mm | **5.0159 mm** | -3.2235 mm | **-0.0357 mm** |
| **Heavy Rain** (>= 20 mm) | 92 | 5.39% | **YES (N<100)** | 25.8370 mm | **17.2809 mm** | -9.2935 mm | -17.2519 mm |

---

## 5. Prediction Range Findings

- **Unconstrained Predictions**: Minimum unclipped prediction was `-0.2759 mm` (186 observations below 0 mm, or 10.89%).
- **Physical Clamping**: Enforcing non-negative lower bounding (>= 0.0 mm) was verified in the pipeline.
- **Upper Tail Behavior**: Max prediction was `26.59 mm` against test peak of `60.80 mm`. Upper tail underprediction is documented.

---

## 6. Heavy-Rainfall Error Investigation (>= 20 mm)

- Across the 92 heavy-rain observations, XGBoost improved MAE over baseline by **`8.56 mm` (33.1% reduction)**.
- Residuals exhibit high correlation with coarse block rainfall ($r = +0.78$) and true rainfall ($r = -0.76$).
- When localized storms occur that are poorly captured by the coarse block input (e.g. `2024-09-02`), both models inevitably under-predict local rain.

---

## 7. Uncertainty Quantification Status

- **Method**: Split Conformal Prediction calibrated on validation data (N=1,722), evaluated on untouched test data (N=1,708).
- **90% Nominal Bound**: q_hat = 13.32 mm, Empirical Test Coverage = **`95.26%`**, Mean Width = **`16.03 mm`**.
- **80% Nominal Bound**: q_hat = 8.17 mm, Empirical Test Coverage = **`90.69%`**, Mean Width = **`10.34 mm`**.
- Conformal prediction intervals are saved to `data/processed/models/test_conformal_predictions.csv`.

---

## 8. Summary of Known Limitations

1. Target is ERA5-Land reanalysis reference proxy, not station ground truth.
2. Input is NASA POWER coarse proxy, not operational NWP forecasts.
3. Limited to 14 Panchayats in Baramati Block.
4. Dataset spans 2023-2024.
5. Extreme precipitation peaks (>= 50 mm) are underpredicted.
6. Baseline is superior during dry periods (< 1 mm).
7. No in-situ AWS station ground validation.
8. Spatial downscaling of historical data, not yet operational lead-time forecasting.

---

## 9. Recommended Next Technical Steps

1. **Two-Stage Hurdle / Regime Routing Model**: Consider a classification step (wet vs dry day) before regression to eliminate small residual drizzle on zero-rain days.
2. **Conditional Conformal Intervals**: Adapt conformal calibration to vary by predicted rainfall regime so intervals are narrower on dry days and wider during storms.
3. **Incorporate AWS Ground Gauge Stations**: Benchmark against IMD/Mahavedh rain gauge stations when station data is accessible.
