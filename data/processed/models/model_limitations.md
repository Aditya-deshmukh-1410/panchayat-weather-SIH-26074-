# Model Limitations and Scientific Boundary Report

This document records the foundational limitations of the current downscaling prototype. These boundaries must be preserved in all documentation and subsequent deployment phases.

---

## 1. Primary Methodological & Data Limitations

1. **ERA5-Land as a Reference Proxy, Not Ground-Truth Station Observations**:
   - The model was trained and evaluated against ERA5-Land reanalysis precipitation (0.1 deg ~ 9 km grid).
   - Reanalysis assimilates satellite and global atmospheric models, but it is not identical to in-situ automatic weather station (AWS) rain gauge measurements.
   - High performance against the ERA5-Land proxy does not establish verified accuracy against ground stations.

2. **NASA POWER / MERRA-2 as a Coarse Historical Input Proxy**:
   - The coarse block input variables are derived from NASA POWER MERRA-2 reanalysis (0.5 deg ~ 50 km).
   - This serves as a proxy for a numerical weather prediction (NWP) block forecast. Operational forecasts from IMD (e.g. WRF, GFS) exhibit different error structures, forecast lead-time degradation, and phase biases.

3. **Restricted Geographic Scope (14 Panchayats in One Block)**:
   - The prototype is localized to 14 Gram Panchayats in Baramati Block, Pune District, Maharashtra.
   - Spatial weights, elevation coefficients, and latitude/longitude attributions are specific to Baramati's local topography (rain shadow of the Western Ghats).
   - The model cannot be transferred to other agro-climatic zones without re-training and re-validation.

4. **Limited Temporal Domain (2023-2024)**:
   - The dataset spans two calendar years (731 days, 10,234 records).
   - Inter-annual climate variability (e.g. strong El Nino vs. La Nina cycles, multi-year droughts) is only partially sampled within this window.

5. **Substantial Negative Bias During Heavy Rainfall Events (>= 20 mm)**:
   - On days with actual rainfall >= 20 mm, XGBoost exhibits a systematic negative bias of -17.25 mm.
   - Regression models trained with squared-error loss naturally shrink extreme predictions toward the conditional mean, under-predicting the severity of high-impact convective storms.

6. **Dry / Light Rainfall Regime Bias**:
   - In dry regimes (< 1 mm, 68.7% of days), the simple baseline achieves lower MAE (0.37 mm) than XGBoost (0.61 mm).
   - The tree ensemble frequently outputs small residual non-zero rainfall (0.3-0.8 mm) on days when actual rainfall is zero.

7. **No Independent Station-Based Ground Validation**:
   - The system has not yet been validated against ground truth from physical rain gauges (e.g., Mahavedh or IMD AWS network).

8. **Historical Spatial Downscaling vs. Operational Forecast Downscaling**:
   - The model performs retrospective spatial downscaling on concurrent historical variables (t).
   - Operational forecast downscaling requires handling forecast lead times (t+24h, t+48h, t+72h), where input forecast uncertainty compounds model downscaling error.

9. **Topographical Homogeneity within Sub-Grids**:
   - Several neighboring Panchayats falling within the same ERA5-Land grid cell share similar reference target values, limiting the empirical resolution of the reanalysis reference proxy.
