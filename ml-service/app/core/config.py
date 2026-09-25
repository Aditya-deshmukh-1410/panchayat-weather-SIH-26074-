"""
config.py
Configuration and Canonical Feature Schema for the ML Inference Service.
"""

import os
from typing import List

# Base directory for the repository
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))

# Canonical path to verified model artifacts
MODELS_DIR = os.getenv(
    "MODELS_DIR",
    os.path.join(BASE_DIR, "data", "processed", "models")
)

MODEL_FILE = os.path.join(MODELS_DIR, "xgb_downscaler.json")
METADATA_FILE = os.path.join(MODELS_DIR, "model_metadata.json")
CALIBRATION_FILE = os.path.join(MODELS_DIR, "uncertainty_calibration.json")

# Exactly 17 approved non-leaking features in exact training order
CANONICAL_FEATURES: List[str] = [
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
