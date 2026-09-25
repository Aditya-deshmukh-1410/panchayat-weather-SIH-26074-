# Data Leakage Prevention Protocol & Partition Rules

**Project**: Panchayat Weather Intelligence & Agro-Meteorological Advisory System  
**Pipeline Role**: Strict Governance on Information Flow and Temporal Partitioning  
**Status**: Mandatory Protocol (Enforced in Preprocessing & Modeling)

---

## 1. Core Principles of Temporal Integrity

In meteorological spatial downscaling, data leakage can easily create falsely optimistic validation scores if future information inadvertently informs predictions for a target date $t$. The system enforces three non-negotiable rules:

1. **Chronological Splitting Only**: Random $K$-fold cross-validation or shuffled train-test splits are **strictly prohibited**. Time-series data must be split forward in time.
2. **Strict Antecedent Lag Windows**: Any historical weather feature engineered for target date $t$ must only contain observations from dates strictly **$\le t-1$**.
3. **Target Masking**: The target variable (`panchayat_rainfall_mm`) at timestamp $t$ must never appear in the feature matrix $X_t$.

---

## 2. Chronological Partitioning Protocol

Based on the empirical audit of 731 continuous synchronous calendar days (2023-01-01 through 2024-12-31 across all 14 Gram Panchayats), the dataset is partitioned as follows:

```
[------------------ TRAINING SET ------------------] [---- VALIDATION ----] [------ TEST SET ------]
  2023-01-01                           2024-04-30     2024-05-01 2024-08-31   2024-09-01 2024-12-31
  486 Days (66.5%)                                    123 Days (16.8%)        122 Days (16.7%)
  6,804 Records (486 d x 14 Panchayats)               1,722 Records           1,708 Records
```

### Partition Justification:
* **Training Partition (`2023-01-01` to `2024-04-30`)**: Encompasses the full 2023 agricultural cycle (Kharif monsoon, Rabi post-monsoon winter, and hot pre-monsoon summer of 2024). Teaches the model seasonal base-rates and orographic relationships.
* **Validation Partition (`2024-05-01` to `2024-08-31`)**: Covers the onset and peak of the 2024 Southwest Monsoon. Used exclusively for hyperparameter tuning and early stopping without touching test data.
* **Test Partition (`2024-09-01` to `2024-12-31`)**: Covers late-monsoon convective thunderstorms and the 2024 Rabi planting window. Represents unseen future weather; reserved strictly for final out-of-sample benchmark evaluation against the baseline.

---

## 3. Strict Historical Feature Windowing Rules

### Example Demonstration (Target = July 10, 2024):
* **Target Variable**: `panchayat_rainfall_mm` on **July 10, 2024**.
* **Allowed Historical Data**:
  - `rainfall_lag_1d`: Observed rainfall on **July 9, 2024**
  - `rainfall_lag_2d`: Observed rainfall on **July 8, 2024**
  - `rainfall_lag_3d`: Observed rainfall on **July 7, 2024**
  - `rainfall_rolling_7d_mean`: Average rainfall over **July 3, 2024 to July 9, 2024** (7 days strictly preceding July 10)
  - `rainfall_rolling_7d_max`: Peak daily rainfall over **July 3, 2024 to July 9, 2024**
* **FORBIDDEN (Leakage Violation)**:
  - Any rainfall information recorded on **July 10, 2024** (same day) or **July 11, 2024 and later** (future days).
  - Computing rolling metrics with centered windows (e.g. `center=True` in pandas). Rolling calculations must always use `closed='left'` or lag shifting `shift(1)`.

### Code Implementation Rule:
In pandas, this is enforced by applying an explicit `.shift(1)` before computing any rolling statistics:

```python
# CORRECT (Leakage-free):
df["rainfall_lag_1d"] = df.groupby("panchayat_id")["panchayat_rainfall_mm"].shift(1)
df["rainfall_rolling_7d_mean"] = (
    df.groupby("panchayat_id")["panchayat_rainfall_mm"]
      .shift(1)
      .rolling(window=7, min_periods=1)
      .mean()
)

# INCORRECT (FATAL LEAKAGE - FORBIDDEN):
# df["rolling_mean"] = df.groupby("panchayat_id")["panchayat_rainfall_mm"].rolling(7).mean()  <-- Includes day t!
```

---

## 4. Input vs. Forecast Alignment

* `block_rainfall`, `block_temp_max`, `block_temp_min`, `block_humidity`, and `block_wind_speed` on day $t$ represent the **coarse meteorological input condition for day $t$** (mimicking a numerical weather forecast valid for day $t$ issued at $t-1$).
* The ML model's task is strictly: Given the coarse block condition for day $t$, plus spatial features and historical observations up to $t-1$, estimate the differentiated local rainfall for Panchayat $p$ on day $t$.
