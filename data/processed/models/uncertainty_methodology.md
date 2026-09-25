# Uncertainty Estimation Methodology: Split Conformal Prediction

**Prototype Implementation**: First Uncertainty Baseline  
**Calibration Dataset**: Validation Split (`2024-05-01` to `2024-08-31`, N=1,722 observations)  
**Evaluation Dataset**: Held-Out Test Split (`2024-09-01` to `2024-12-31`, N=1,708 observations, strictly untouched during calibration)  

---

## 1. Statistical Foundation

To prevent the fabrication of heuristic or unvalidated 'confidence percentages', we implemented **Split Conformal Prediction** (inductive conformal prediction), a distribution-free uncertainty framework providing finite-sample coverage guarantees under exchangeability.

### 1.1 Non-Conformity Score
For each observation $i$ in the separate calibration set, the absolute prediction residual is computed:
$$s_i = |y_i - \hat{y}_i|$$

### 1.2 Conformal Cutoff Determination
For a target miscoverage level alpha in (0, 1) (corresponding to 1 - alpha nominal coverage):
$$\hat{q}_{1-\alpha} = \text{Quantile}\left(s, \frac{\lceil (n_{\text{cal}} + 1)(1 - \alpha) \rceil}{n_{\text{cal}}}\right)$$
where $n_{\text{cal}} = 1,722$.

### 1.3 Prediction Interval Construction
For any test point with prediction $\hat{y}_{\text{test}}$:
$$\text{lower\_bound} = \max(0.0, \hat{y}_{\text{test}} - \hat{q}_{1-\alpha})$$
$$\text{upper\_bound} = \hat{y}_{\text{test}} + \hat{q}_{1-\alpha}$$
$$\text{interval\_width} = \text{upper\_bound} - \text{lower\_bound}$$

*Note: The interval is bounded below at zero to respect physical non-negativity.*

---

## 2. Empirical Verification on Held-Out Test Partition

| Nominal Target Coverage (1 - alpha) | Cutoff q_hat | Mean Interval Width | Empirical Coverage on Test Set | Validity Assessment |
|---|---|---|---|---|
| **90% Nominal Coverage** (alpha = 0.10) | `13.3181 mm` | `16.0298 mm` | **`95.26%`** | **Coverage Target Exceeded (>90%)** |
| **80% Nominal Coverage** (alpha = 0.20) | `8.1682 mm` | `10.3381 mm` | **`90.69%`** | **Coverage Target Exceeded (>80%)** |

### Critical Scientific Caveats
1. **Not a Heuristic Confidence Percentage**: These intervals represent statistically grounded split-conformal coverage bounds, not subjective likelihoods.
2. **Marginal Coverage vs. Conditional Coverage**: Standard split conformal prediction guarantees marginal coverage across the entire test distribution. It does not guarantee conditional coverage within extreme sub-regimes (e.g. intervals may under-cover during extreme localized storms >= 40 mm and over-cover during prolonged dry periods).
3. **Distributional Shift**: The calibration partition covers the summer/monsoon period (May-August), while the test partition spans the post-monsoon/winter season (September-December). Seasonal changes in rainfall variance directly influence interval conservativeness.
