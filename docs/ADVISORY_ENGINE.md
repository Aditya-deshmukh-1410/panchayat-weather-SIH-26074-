# Agro-Meteorological Advisory Engine

## 1. Purpose & Overview

The **Agro-Meteorological Advisory Engine** translates localized, downscaled weather predictions and conformal uncertainty intervals into actionable, transparent agricultural guidance for Gram Panchayats.

It addresses the fundamental SIH 2026 challenge: bridging the operational gap between raw numerical meteorological outputs and farm-level decision-making.

> [!IMPORTANT]
> **Operational Disclaimer**:
> This advisory engine is a deterministic prototype rule layer. It does not replace official agricultural advisories (such as IMD Agromet / Gramin Krishi Mausam Sewa) or crop-specific expert agronomist recommendations.

---

## 2. Core Architectural Principles

1. **Deterministic & Inspectable**:
   - The decision logic is 100% rule-based and inspectable in code (`backend/src/modules/advisories/rules/rainfall.rules.ts`).
   - No black-box Large Language Models (LLMs) or generative hallucinations are used in the advisory generation pipeline.
2. **Scientifically Honest**:
   - Inputs originate from historical downscaling experiments (NASA POWER / MERRA-2 0.5° input proxy downscaled via XGBoost to an ERA5-Land 0.1° reference proxy).
   - Predictions are not presented as live station forecasts or ground truth.
3. **Evidence-Grounded**:
   - Because farm-specific soil sensor data, crop varieties, sowing dates, and growth stages are not ingested in this phase, the advisory avoids asserting mandatory irrigation volumes or disease outbreaks.
   - Cautious, observational language is strictly enforced ("Consider...", "Monitor...", "May affect...").
4. **Uncertainty-Aware**:
   - Predictions include 80% and 90% split-conformal prediction intervals.
   - Prediction intervals are **never** converted into event probabilities (e.g., "80% chance of rain" is scientifically invalid). Instead, intervals reflect physical dispersion bounds ($[L, U]$ in mm).

---

## 3. Input Specification

The endpoint `POST /api/advisories` accepts:

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `panchayat_id` | String | Yes | Alphanumeric | Gram Panchayat identifier (e.g. `P01` to `P14`) |
| `panchayat_name` | String | No | - | Name of the Gram Panchayat (e.g. `Baburdi`) |
| `date` | String | Yes | YYYY-MM-DD | Historical experiment date |
| `rainfall_mm` | Float | Yes | $\ge 0.0$ | Downscaled precipitation prediction (mm) |
| `lower_80_mm` | Float | No | $\ge 0.0, \le \text{upper}$ | Split-conformal 80% lower bound (mm) |
| `upper_80_mm` | Float | No | $\ge 0.0, \ge \text{lower}$ | Split-conformal 80% upper bound (mm) |
| `lower_90_mm` | Float | No | $\ge 0.0, \le \text{upper}$ | Split-conformal 90% lower bound (mm) |
| `upper_90_mm` | Float | No | $\ge 0.0, \ge \text{lower}$ | Split-conformal 90% upper bound (mm) |
| `temperature_max` | Float | No | $[-20, 65]\text{ }^\circ\text{C}$ | Daily maximum temperature |
| `temperature_min` | Float | No | $[-30, 55]\text{ }^\circ\text{C}$ | Daily minimum temperature |
| `humidity` | Float | No | $[0, 100]\%$ | Relative humidity |
| `wind_speed` | Float | No | $[0, 150]\text{ m/s}$ | 2-meter wind speed |
| `model_version` | String | No | - | Active XGBoost model version |
| `baseline_block_rainfall`| Float | No | $\ge 0.0$ | Coarse block-scale baseline rainfall |

---

## 4. Deterministic Rainfall Rules & Severity Matrix

The prototype classifies daily downscaled precipitation $r$ into four tiers:

| Category Key | Category Label | Rainfall Range ($r$ in mm) | Default Severity | Headline |
|---|---|---|---|---|
| `very_low` | DRY / VERY LOW RAINFALL | $0.0 \le r < 1.0$ | `INFO` | Dry / Very low rainfall signal |
| `light` | LIGHT RAINFALL | $1.0 \le r < 5.0$ | `INFO` | Light rainfall signal |
| `moderate` | MODERATE RAINFALL | $5.0 \le r < 20.0$ | `WATCH` | Moderate rainfall signal |
| `heavy` | HEAVY RAINFALL | $r \ge 20.0$ | `CAUTION` | Heavy rainfall signal |

### Strict Boundary Handling
- $r = 0.0\text{ mm} \rightarrow \text{very\_low}$
- $r = 1.0\text{ mm} \rightarrow \text{light}$
- $r = 5.0\text{ mm} \rightarrow \text{moderate}$
- $r = 20.0\text{ mm} \rightarrow \text{heavy}$

### Advisory Recommendations by Regime
- **VERY LOW ($< 1\text{ mm}$)**:
  - "Rainfall signal is low (< 1 mm); localized rainfall contribution to soil moisture is likely limited."
  - "Avoid assuming irrigation is strictly required without verifying local plot-level soil moisture."
  - "Monitor local field conditions and upcoming weather updates before scheduling farm operations."
- **LIGHT ($1–5\text{ mm}$)**:
  - "Light precipitation (1–5 mm) is indicated for the Panchayat."
  - "Consider expected rainfall before scheduling irrigation or chemical spray operations."
  - "Monitor topsoil moisture and microclimatic conditions across fields."
- **MODERATE ($5–20\text{ mm}$)**:
  - "Moderate rainfall (5–20 mm) is indicated for the Panchayat."
  - "Consider postponing sensitive field operations (e.g. spraying, weeding, harvesting) that depend on dry foliage or soil."
  - "Monitor plot drainage channels and standing water in lower plot sections."
- **HEAVY ($\ge 20\text{ mm}$)**:
  - "Heavy rainfall (≥ 20 mm) is indicated for the Panchayat."
  - "Monitor water accumulation, drainage channels, and bund integrity across plots."
  - "Consider avoiding field operations, fertilizer broadcasting, and chemical applications during and immediately following heavy rainfall."
  - "Monitor vulnerable low-lying fields for waterlogging risk."

---

## 5. Split-Conformal Uncertainty-Aware Evaluation

When split-conformal intervals $[L_{80}, U_{80}]$ are provided:
1. **Regime Span Detection**:
   The engine computes the category for both $L_{80}$ and $U_{80}$. If $\text{category}(L_{80}) \neq \text{category}(U_{80})$, `spans_multiple_categories` is set to `true`.
2. **Transparent Regime Note**:
   A note is added: *"Rainfall category has uncertainty: the calibrated interval spans [lowest_category] through [highest_category] rainfall."*
3. **Severity Escalation**:
   If the point estimate is in an `INFO` regime (e.g. `light`), but the upper bound reaches $\ge 5.0\text{ mm}$ (moderate or heavy), the severity is elevated to `WATCH` with the note:
   *"Severity elevated to WATCH due to calibrated upper bound extending into higher rainfall regimes."*

---

## 6. Ancillary Meteorological Notices

Optional weather variables trigger cautious environmental notices:
- **Relative Humidity $\ge 85\%$**:
  *"High relative humidity is indicated. Local crop and field conditions should be monitored, particularly where prolonged moisture is present."*
- **Maximum Temperature $\ge 38^\circ\text{C}$**:
  *"Elevated maximum temperature is indicated; local crop and soil conditions may affect moisture demand."*
- **Wind Speed $\ge 10\text{ m/s}$**:
  *"Brisk wind speeds (≥ 10 m/s) indicated; consider delaying foliar or pesticide spraying to avoid drift."*

---

## 7. Example Output

### Request: Baburdi (P01) on 2024-09-01
```json
{
  "panchayat_id": "P01",
  "panchayat_name": "Baburdi",
  "date": "2024-09-01",
  "rainfall_mm": 8.564,
  "lower_80_mm": 0.3958,
  "upper_80_mm": 16.7322,
  "temperature_max": 26.72,
  "temperature_min": 21.5,
  "humidity": 90.61,
  "wind_speed": 4.11,
  "model_version": "v0.1.0-alpha",
  "baseline_block_rainfall": 5.62
}
```

### Response:
```json
{
  "panchayat_id": "P01",
  "panchayat_name": "Baburdi",
  "date": "2024-09-01",
  "rainfall_mm": 8.56,
  "rainfall_category": "moderate",
  "category_label": "MODERATE RAINFALL",
  "severity": "WATCH",
  "headline": "Moderate rainfall signal",
  "recommendations": [
    "Moderate rainfall (5–20 mm) is indicated for the Panchayat.",
    "Consider postponing sensitive field operations (e.g. spraying, weeding, harvesting) that depend on dry foliage or soil.",
    "Monitor plot drainage channels and standing water in lower plot sections."
  ],
  "ancillary_notices": [
    "High relative humidity is indicated. Local crop and field conditions should be monitored, particularly where prolonged moisture is present."
  ],
  "uncertainty": {
    "level": "80%",
    "lower_mm": 0.4,
    "upper_mm": 16.73,
    "interval_width_mm": 16.33,
    "spans_multiple_categories": true,
    "categories_spanned": [
      "very_low",
      "light",
      "moderate"
    ],
    "uncertainty_note": "Rainfall category has uncertainty: the calibrated interval spans dry / very low rainfall through moderate rainfall."
  },
  "basis": [
    "ML downscaled precipitation prediction (XGBoost v0.1.0-alpha)",
    "Split-conformal prediction intervals calibrated on Baramati validation partition",
    "Deterministic rule engine thresholds"
  ],
  "data_context": {
    "historical_experiment": true,
    "experiment_date": "2024-09-01",
    "reference_proxy": "ERA5-Land (0.1°)",
    "input_proxy": "NASA POWER / MERRA-2 (0.5°)",
    "model_version": "v0.1.0-alpha",
    "disclaimer": "This advisory is generated by a deterministic prototype rule engine based on a retrospective downscaling experiment. It does not replace official IMD/agricultural department forecasts or expert agronomist recommendations."
  }
}
```

---

## 8. Limitations & Future Roadmap

1. **Retrospective Limitation**: Historical reanalysis proxies are used to simulate coarse-to-fine disaggregation; live NWP integration is out of scope for this prototype phase.
2. **Crop Agnostic**: Advisories reflect general meteorological exposure rather than crop phenology. Future phases will integrate crop calendars and soil moisture sensors.
3. **Rule Governance**: Rules can be customized per agro-climatic zone without altering the core downscaling pipeline.
