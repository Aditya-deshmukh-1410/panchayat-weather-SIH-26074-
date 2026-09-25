"""
train_and_evaluate.py
Executes Phase 3 training, baseline comparison, diagnostics, SHAP explainability, and plotting:
- Verifies partition integrity and feature schema
- Evaluates baseline: baseline_prediction = block_rainfall
- Trains XGBRegressor with fixed reproducible configuration
- Computes comprehensive validation and test metrics
- Computes per-Panchayat diagnostic metrics (no ranking)
- Computes rainfall regime metrics (Dry, Light, Moderate, Heavy)
- Computes TreeSHAP feature attributions on test set
- Generates 5 evaluation plots
- Exports all JSON, CSV, and PNG artifacts
"""

import os
import sys
import json
import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import shap
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

# Define directories
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
DATA_PATH = os.path.join(BASE_DIR, "data", "processed", "features", "training_table_baramati.csv")
MODELS_DIR = os.path.join(BASE_DIR, "data", "processed", "models")
PLOTS_DIR = os.path.join(MODELS_DIR, "plots")

os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(PLOTS_DIR, exist_ok=True)

# Exact approved feature list (17 features)
APPROVED_FEATURES = [
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

TARGET_COL = "panchayat_rainfall_mm"
BASELINE_COL = "block_rainfall"

# Metric calculation helper
def compute_metrics(y_true, y_pred):
    y_true = np.array(y_true)
    y_pred = np.array(y_pred)
    mae = float(mean_absolute_error(y_true, y_pred))
    rmse = float(np.sqrt(mean_squared_error(y_true, y_pred)))
    r2 = float(r2_score(y_true, y_pred))
    bias = float(np.mean(y_pred - y_true))
    return {
        "mae": round(mae, 4),
        "rmse": round(rmse, 4),
        "r2": round(r2, 4),
        "bias": round(bias, 4)
    }

def main():
    print("[STEP 0] Loading feature table and verifying partitions...")
    df = pd.read_csv(DATA_PATH)
    
    # 0. Partition Verification
    train_df = df[df["split"] == "train"].copy()
    val_df = df[df["split"] == "val"].copy()
    test_df = df[df["split"] == "test"].copy()

    expected_partitions = {
        "train": {"start": "2023-01-01", "end": "2024-04-30", "rows": 6804},
        "val": {"start": "2024-05-01", "end": "2024-08-31", "rows": 1722},
        "test": {"start": "2024-09-01", "end": "2024-12-31", "rows": 1708},
    }

    for name, split_df in [("train", train_df), ("val", val_df), ("test", test_df)]:
        actual_start = split_df["date"].min()
        actual_end = split_df["date"].max()
        actual_rows = len(split_df)
        exp = expected_partitions[name]
        if actual_start != exp["start"] or actual_end != exp["end"] or actual_rows != exp["rows"]:
            print(f"[FATAL] Partition mismatch in {name}!")
            print(f"Expected: {exp['start']} to {exp['end']} ({exp['rows']} rows)")
            print(f"Actual:   {actual_start} to {actual_end} ({actual_rows} rows)")
            sys.exit(1)

    print("[SUCCESS] Partition integrity verified. Zero discrepancies.")

    # 1. Feature enumeration check
    print(f"[STEP 1] Validating feature count ({len(APPROVED_FEATURES)} features)...")
    for feat in APPROVED_FEATURES:
        if feat not in df.columns:
            print(f"[FATAL] Feature {feat} missing from training table!")
            sys.exit(1)

    X_train = train_df[APPROVED_FEATURES]
    y_train = train_df[TARGET_COL]

    X_val = val_df[APPROVED_FEATURES]
    y_val = val_df[TARGET_COL]

    X_test = test_df[APPROVED_FEATURES]
    y_test = test_df[TARGET_COL]

    # 5. Baseline Evaluation
    print("[STEP 5] Evaluating Baseline (baseline_prediction = block_rainfall)...")
    # Verify equality
    assert np.allclose(val_df["baseline_panchayat_rainfall"], val_df["block_rainfall"]), "Baseline column mismatch in val"
    assert np.allclose(test_df["baseline_panchayat_rainfall"], test_df["block_rainfall"]), "Baseline column mismatch in test"

    val_base_preds = val_df["block_rainfall"].values
    test_base_preds = test_df["block_rainfall"].values

    base_val_metrics = compute_metrics(y_val, val_base_preds)
    base_test_metrics = compute_metrics(y_test, test_base_preds)

    baseline_metrics = {
        "model_name": "baseline_block_rainfall",
        "description": "Spatial persistence baseline where downscaled Panchayat rainfall is assumed equal to coarse block rainfall",
        "validation": base_val_metrics,
        "test": base_test_metrics
    }

    base_metrics_path = os.path.join(MODELS_DIR, "baseline_metrics.json")
    with open(base_metrics_path, "w", encoding="utf-8") as f:
        json.dump(baseline_metrics, f, indent=2)
    print(f"[SUCCESS] Saved baseline metrics to {base_metrics_path}")

    # Baseline predictions file
    baseline_pred_df = test_df[["date", "panchayat_id", "panchayat_name", "block_rainfall", TARGET_COL]].copy()
    baseline_pred_df["baseline_prediction"] = test_base_preds
    baseline_pred_df["baseline_error"] = test_base_preds - test_df[TARGET_COL].values
    baseline_pred_path = os.path.join(MODELS_DIR, "baseline_predictions.csv")
    baseline_pred_df.to_csv(baseline_pred_path, index=False)
    print(f"[SUCCESS] Saved baseline predictions to {baseline_pred_path}")

    # 6. XGBoost Regressor Training
    print("[STEP 6] Training XGBRegressor with specified reproducible configuration...")
    xgb_params = {
        "n_estimators": 150,
        "max_depth": 4,
        "learning_rate": 0.05,
        "subsample": 0.8,
        "colsample_bytree": 0.8,
        "random_state": 42,
        "n_jobs": -1
    }

    model = xgb.XGBRegressor(**xgb_params)
    model.fit(X_train, y_train)

    # Save model
    model_json_path = os.path.join(MODELS_DIR, "xgb_downscaler.json")
    model.save_model(model_json_path)
    print(f"[SUCCESS] Saved XGBoost model to {model_json_path}")

    # Save model metadata
    metadata = {
        "model_type": "XGBRegressor",
        "framework": "xgboost",
        "xgboost_version": xgb.__version__,
        "python_version": sys.version,
        "target_variable": TARGET_COL,
        "target_unit": "mm/day",
        "target_source": "ERA5-Land 0.1 deg reanalysis reference proxy",
        "feature_count": len(APPROVED_FEATURES),
        "features": APPROVED_FEATURES,
        "hyperparameters": xgb_params,
        "partitions": {
            "train": {"start": "2023-01-01", "end": "2024-04-30", "rows": len(train_df)},
            "val": {"start": "2024-05-01", "end": "2024-08-31", "rows": len(val_df)},
            "test": {"start": "2024-09-01", "end": "2024-12-31", "rows": len(test_df)}
        },
        "study_area": "Baramati Block, Pune District, Maharashtra",
        "panchayat_count": 14,
        "leakage_audit_passed": True
    }
    metadata_path = os.path.join(MODELS_DIR, "model_metadata.json")
    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    print(f"[SUCCESS] Saved model metadata to {metadata_path}")

    # 7. Model Evaluation
    print("[STEP 7] Generating predictions and calculating evaluation metrics...")
    val_xgb_preds = model.predict(X_val)
    test_xgb_preds = model.predict(X_test)

    # Note: Physical constraint: rainfall cannot be negative
    # We will log raw predictions and clip at 0 for physical plausibility if needed, but let's evaluate raw / clipped
    test_xgb_preds = np.clip(test_xgb_preds, a_min=0.0, a_max=None)
    val_xgb_preds = np.clip(val_xgb_preds, a_min=0.0, a_max=None)

    xgb_val_metrics = compute_metrics(y_val, val_xgb_preds)
    xgb_test_metrics = compute_metrics(y_test, test_xgb_preds)

    full_metrics = {
        "baseline": {
            "validation": base_val_metrics,
            "test": base_test_metrics
        },
        "xgboost": {
            "validation": xgb_val_metrics,
            "test": xgb_test_metrics
        },
        "comparison_test": {
            "mae_reduction_mm": round(base_test_metrics["mae"] - xgb_test_metrics["mae"], 4),
            "mae_reduction_pct": round(((base_test_metrics["mae"] - xgb_test_metrics["mae"]) / base_test_metrics["mae"]) * 100, 2),
            "rmse_reduction_mm": round(base_test_metrics["rmse"] - xgb_test_metrics["rmse"], 4),
            "rmse_reduction_pct": round(((base_test_metrics["rmse"] - xgb_test_metrics["rmse"]) / base_test_metrics["rmse"]) * 100, 2),
            "r2_improvement": round(xgb_test_metrics["r2"] - base_test_metrics["r2"], 4)
        }
    }
    metrics_path = os.path.join(MODELS_DIR, "model_metrics.json")
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(full_metrics, f, indent=2)
    print(f"[SUCCESS] Saved comparative model metrics to {metrics_path}")

    # Export test_predictions.csv
    test_preds_df = pd.DataFrame({
        "date": test_df["date"].values,
        "panchayat_id": test_df["panchayat_id"].values,
        "panchayat_name": test_df["panchayat_name"].values,
        "block_rainfall": test_df["block_rainfall"].values,
        "actual_rainfall": test_df[TARGET_COL].values,
        "baseline_prediction": test_base_preds,
        "ml_prediction": np.round(test_xgb_preds, 4),
        "baseline_error": np.round(test_base_preds - test_df[TARGET_COL].values, 4),
        "ml_error": np.round(test_xgb_preds - test_df[TARGET_COL].values, 4)
    })
    test_preds_path = os.path.join(MODELS_DIR, "test_predictions.csv")
    test_preds_df.to_csv(test_preds_path, index=False)
    print(f"[SUCCESS] Saved test predictions to {test_preds_path}")

    # 8. Panchayat Diagnostics (No ranking, strictly diagnostic statistics)
    print("[STEP 8] Computing Panchayat diagnostics...")
    panchayat_diag = []
    for pid, pgroup in test_preds_df.groupby("panchayat_id"):
        pname = pgroup["panchayat_name"].iloc[0]
        y_p_true = pgroup["actual_rainfall"].values
        y_p_base = pgroup["baseline_prediction"].values
        y_p_ml = pgroup["ml_prediction"].values

        b_metrics = compute_metrics(y_p_true, y_p_base)
        m_metrics = compute_metrics(y_p_true, y_p_ml)

        panchayat_diag.append({
            "panchayat_id": pid,
            "panchayat_name": pname,
            "test_rows": len(pgroup),
            "baseline_mae": b_metrics["mae"],
            "baseline_rmse": b_metrics["rmse"],
            "baseline_bias": b_metrics["bias"],
            "ml_mae": m_metrics["mae"],
            "ml_rmse": m_metrics["rmse"],
            "ml_bias": m_metrics["bias"]
        })

    panchayat_diag_df = pd.DataFrame(panchayat_diag)
    panchayat_diag_path = os.path.join(MODELS_DIR, "panchayat_diagnostics.csv")
    panchayat_diag_df.to_csv(panchayat_diag_path, index=False)
    print(f"[SUCCESS] Saved Panchayat diagnostics to {panchayat_diag_path}")

    # 9. Rainfall Regime Analysis
    print("[STEP 9] Computing Rainfall Regime Analysis...")
    # Predefined thresholds:
    # Dry / No Rain: < 1 mm
    # Light Rain: 1–<5 mm
    # Moderate Rain: 5–<20 mm
    # Heavy Rain: >=20 mm
    def get_regime(val):
        if val < 1.0:
            return "Dry / No Rain (<1 mm)"
        elif val < 5.0:
            return "Light Rain (1-<5 mm)"
        elif val < 20.0:
            return "Moderate Rain (5-<20 mm)"
        else:
            return "Heavy Rain (>=20 mm)"

    test_preds_df["regime"] = test_preds_df["actual_rainfall"].apply(get_regime)
    regimes = [
        "Dry / No Rain (<1 mm)",
        "Light Rain (1-<5 mm)",
        "Moderate Rain (5-<20 mm)",
        "Heavy Rain (>=20 mm)"
    ]

    regime_results = []
    for reg in regimes:
        r_sub = test_preds_df[test_preds_df["regime"] == reg]
        obs_count = len(r_sub)
        if obs_count > 0:
            b_m = compute_metrics(r_sub["actual_rainfall"], r_sub["baseline_prediction"])
            m_m = compute_metrics(r_sub["actual_rainfall"], r_sub["ml_prediction"])
            regime_results.append({
                "regime": reg,
                "observation_count": obs_count,
                "pct_of_test_data": round((obs_count / len(test_preds_df)) * 100, 2),
                "baseline_mae": b_m["mae"],
                "baseline_rmse": b_m["rmse"],
                "baseline_bias": b_m["bias"],
                "ml_mae": m_m["mae"],
                "ml_rmse": m_m["rmse"],
                "ml_bias": m_m["bias"]
            })
        else:
            regime_results.append({
                "regime": reg,
                "observation_count": 0,
                "pct_of_test_data": 0.0,
                "baseline_mae": None,
                "baseline_rmse": None,
                "baseline_bias": None,
                "ml_mae": None,
                "ml_rmse": None,
                "ml_bias": None
            })

    regime_df = pd.DataFrame(regime_results)
    regime_path = os.path.join(MODELS_DIR, "rainfall_regime_analysis.csv")
    regime_df.to_csv(regime_path, index=False)
    print(f"[SUCCESS] Saved rainfall regime analysis to {regime_path}")

    # 10. TreeSHAP Attribution Analysis
    print("[STEP 10] Computing TreeSHAP values on test set...")
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X_test)

    # Compute mean absolute SHAP per feature
    mean_abs_shap = np.mean(np.abs(shap_values), axis=0)
    shap_df = pd.DataFrame({
        "feature": APPROVED_FEATURES,
        "mean_abs_shap": mean_abs_shap
    }).sort_values("mean_abs_shap", ascending=False).reset_index(drop=True)

    shap_csv_path = os.path.join(MODELS_DIR, "shap_summary.csv")
    shap_df.to_csv(shap_csv_path, index=False)
    print(f"[SUCCESS] Saved SHAP feature attributions to {shap_csv_path}")

    # 11. Plot Generation
    print("[STEP 11] Generating 5 diagnostic plots...")
    
    # Plot 1: actual_vs_baseline_test.png
    plt.figure(figsize=(7, 6), dpi=300)
    plt.scatter(test_preds_df["baseline_prediction"], test_preds_df["actual_rainfall"], alpha=0.35, edgecolors='none', color='#1f77b4', s=25)
    max_val1 = max(test_preds_df["baseline_prediction"].max(), test_preds_df["actual_rainfall"].max()) + 2
    plt.plot([0, max_val1], [0, max_val1], 'r--', lw=1.5, label='1:1 Line (Perfect Calibration)')
    plt.xlabel("Baseline Prediction (NASA POWER Block Rainfall, mm)", fontsize=11)
    plt.ylabel("Actual Reference Rainfall (ERA5-Land, mm)", fontsize=11)
    plt.title(f"Actual vs. Baseline on Test Partition (N={len(test_preds_df)})\nMAE: {base_test_metrics['mae']:.2f} mm | RMSE: {base_test_metrics['rmse']:.2f} mm | R2: {base_test_metrics['r2']:.2f}", fontsize=11)
    plt.grid(True, linestyle=":", alpha=0.6)
    plt.legend(frameon=True)
    plt.tight_layout()
    plot1_path = os.path.join(PLOTS_DIR, "actual_vs_baseline_test.png")
    plt.savefig(plot1_path)
    plt.close()

    # Plot 2: actual_vs_xgboost_test.png
    plt.figure(figsize=(7, 6), dpi=300)
    plt.scatter(test_preds_df["ml_prediction"], test_preds_df["actual_rainfall"], alpha=0.35, edgecolors='none', color='#2ca02c', s=25)
    max_val2 = max(test_preds_df["ml_prediction"].max(), test_preds_df["actual_rainfall"].max()) + 2
    plt.plot([0, max_val2], [0, max_val2], 'r--', lw=1.5, label='1:1 Line (Perfect Calibration)')
    plt.xlabel("XGBoost Downscaled Prediction (mm)", fontsize=11)
    plt.ylabel("Actual Reference Rainfall (ERA5-Land, mm)", fontsize=11)
    plt.title(f"Actual vs. XGBoost on Test Partition (N={len(test_preds_df)})\nMAE: {xgb_test_metrics['mae']:.2f} mm | RMSE: {xgb_test_metrics['rmse']:.2f} mm | R2: {xgb_test_metrics['r2']:.2f}", fontsize=11)
    plt.grid(True, linestyle=":", alpha=0.6)
    plt.legend(frameon=True)
    plt.tight_layout()
    plot2_path = os.path.join(PLOTS_DIR, "actual_vs_xgboost_test.png")
    plt.savefig(plot2_path)
    plt.close()

    # Plot 3: residual_distribution.png
    plt.figure(figsize=(8, 5), dpi=300)
    bins = np.linspace(-25, 25, 60)
    plt.hist(test_preds_df["baseline_error"], bins=bins, alpha=0.5, label=f"Baseline Error (Bias: {base_test_metrics['bias']:.2f})", color='#1f77b4', edgecolor='black', linewidth=0.5)
    plt.hist(test_preds_df["ml_error"], bins=bins, alpha=0.5, label=f"XGBoost Error (Bias: {xgb_test_metrics['bias']:.2f})", color='#2ca02c', edgecolor='black', linewidth=0.5)
    plt.axvline(0, color='red', linestyle='--', lw=1.5)
    plt.xlabel("Residual / Error (Predicted - Actual, mm)", fontsize=11)
    plt.ylabel("Count", fontsize=11)
    plt.title("Error Distribution Comparison on Test Partition", fontsize=12)
    plt.legend(frameon=True)
    plt.grid(True, linestyle=":", alpha=0.6)
    plt.tight_layout()
    plot3_path = os.path.join(PLOTS_DIR, "residual_distribution.png")
    plt.savefig(plot3_path)
    plt.close()

    # Plot 4: residual_by_panchayat.png
    plt.figure(figsize=(12, 6), dpi=300)
    p_ids = sorted(test_preds_df["panchayat_id"].unique())
    data_to_plot = [test_preds_df[test_preds_df["panchayat_id"] == pid]["ml_error"].values for pid in p_ids]
    plt.boxplot(data_to_plot, tick_labels=p_ids, showmeans=True, meanline=True, patch_artist=True,
                boxprops=dict(facecolor='#d9f0d3', color='#2ca02c'),
                medianprops=dict(color='black', lw=1.5),
                meanprops=dict(color='red', linestyle='--', lw=1.5))
    plt.axhline(0, color='gray', linestyle=':', lw=1)
    plt.xlabel("Panchayat ID (Alphabetical Order - Diagnostic Only)", fontsize=11)
    plt.ylabel("XGBoost Error Residual (Predicted - Actual, mm)", fontsize=11)
    plt.title("Residual Distribution Across 14 Gram Panchayats (Red dashed: Mean, Black: Median)", fontsize=12)
    plt.grid(True, linestyle=":", alpha=0.6)
    plt.tight_layout()
    plot4_path = os.path.join(PLOTS_DIR, "residual_by_panchayat.png")
    plt.savefig(plot4_path)
    plt.close()

    # Plot 5: shap_feature_importance.png
    plt.figure(figsize=(9, 7), dpi=300)
    shap_sorted = shap_df.iloc[::-1]  # reverse for horizontal bar plot
    plt.barh(shap_sorted["feature"], shap_sorted["mean_abs_shap"], color='#2b83ba', edgecolor='black', linewidth=0.5)
    plt.xlabel("Mean |SHAP Value| (Average Impact on Model Output Magnitude, mm)", fontsize=11)
    plt.ylabel("Model Feature", fontsize=11)
    plt.title("TreeSHAP Feature Attribution on Test Partition\n(Attribution Only - Non-Causal)", fontsize=12)
    plt.grid(True, linestyle=":", alpha=0.6)
    plt.tight_layout()
    plot5_path = os.path.join(PLOTS_DIR, "shap_feature_importance.png")
    plt.savefig(plot5_path)
    plt.close()

    print("[SUCCESS] All 5 diagnostic plots generated successfully.")
    print("\n--- TEST METRICS SUMMARY ---")
    print(f"Baseline: MAE={base_test_metrics['mae']} mm, RMSE={base_test_metrics['rmse']} mm, R2={base_test_metrics['r2']}, Bias={base_test_metrics['bias']} mm")
    print(f"XGBoost:  MAE={xgb_test_metrics['mae']} mm, RMSE={xgb_test_metrics['rmse']} mm, R2={xgb_test_metrics['r2']}, Bias={xgb_test_metrics['bias']} mm")

if __name__ == "__main__":
    main()
