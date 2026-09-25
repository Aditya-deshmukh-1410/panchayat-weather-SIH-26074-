# Prediction Boundary and Range Analysis

**Evaluation Partition**: Held-Out Test Set (`2024-09-01` to `2024-12-31`, N=1,708)  
**Target Variable**: Daily Panchayat Precipitation (`panchayat_rainfall_mm`)  

---

## 1. Summary of Prediction Distributions

| Statistic | Raw XGBoost Predictions | Non-Negative Bounded (>= 0) | Actual Reference Rainfall |
|---|---|---|---|
| **Minimum** | `-0.2759 mm` | `0.0000 mm` | `0.0000 mm` |
| **Median (50th %ile)** | `0.3065 mm` | `0.3065 mm` | `0.0000 mm` |
| **95th Percentile** | `15.8797 mm` | `15.8797 mm` | `20.8300 mm` |
| **99th Percentile** | `21.5084 mm` | `21.5084 mm` | `36.1650 mm` |
| **Maximum** | `26.5905 mm` | `26.5905 mm` | `60.8000 mm` |
| **Negative Predictions Count** | `186` (10.89%) | `0` (0.00%) | `0` (0.00%) |

---

## 2. Analysis of Physical Boundary Constraints

### 2.1 Negative Predictions
- The unconstrained tree ensemble produced **`186` negative predictions** (out of 1,708 test observations, or **`10.89%`**).
- The lowest negative prediction observed was **`-0.2759 mm`**.
- **Implementation of Non-Negative Lower Bounding**:
  - In `ml-service/training/train_and_evaluate.py` (lines 191-192), post-prediction clamping was explicitly applied:
    ```python
    val_xgb_preds = np.clip(val_xgb_preds, a_min=0.0, a_max=None)
    test_xgb_preds = np.clip(test_xgb_preds, a_min=0.0, a_max=None)
    ```
  - This reflects the domain constraint that atmospheric precipitation cannot be negative.
  - No upper-bound clipping was applied.

### 2.2 Plausibility & Range Compliance
- **Upper Bound Check**: The maximum predicted value was **`26.5905 mm`**, which is strictly within the historical training record maximum of **`77.80 mm`**. No implausibly extreme values (e.g. >200 mm) were generated.
- **Underprediction of Upper Tail**: While actual test rainfall peaked at **`60.80 mm`**, the maximum model prediction reached only **`26.59 mm`**. The 99th percentile of predictions (`21.51 mm`) also fell below the 99th percentile of actual rainfall (`36.17 mm`), reflecting significant regression shrinkage on tail extremes.
