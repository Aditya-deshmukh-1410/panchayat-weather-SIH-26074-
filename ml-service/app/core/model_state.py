"""
model_state.py
Singleton managing the lifecycle, loading, and deterministic inference
of the frozen XGBoost downscaling model and split-conformal calibration artifacts.
"""

import os
import json
import logging
import numpy as np
import xgboost as xgb
from typing import Dict, Any, Optional, Tuple
from app.core.config import (
    MODEL_FILE,
    METADATA_FILE,
    CALIBRATION_FILE,
    CANONICAL_FEATURES
)

logger = logging.getLogger("ml-service.model_state")

class ModelState:
    """
    In-memory state holder for the frozen XGBoost model and conformal uncertainty artifacts.
    """
    def __init__(self):
        self.model: Optional[xgb.XGBRegressor] = None
        self.metadata: Dict[str, Any] = {}
        self.calibration: Dict[str, Any] = {}
        self.model_version: str = "v0.1.0-alpha"
        self.q_hat_80: Optional[float] = None
        self.q_hat_90: Optional[float] = None
        self.is_ready: bool = False
        self.error_message: Optional[str] = None

    def load_artifacts(self, model_path: str = MODEL_FILE,
                       metadata_path: str = METADATA_FILE,
                       calibration_path: str = CALIBRATION_FILE) -> bool:
        """
        Loads the frozen model, metadata, and conformal calibration once at startup.
        """
        try:
            # 1. Verify existence
            if not os.path.isfile(model_path):
                raise FileNotFoundError("Model artifact file not found.")
            if not os.path.isfile(metadata_path):
                raise FileNotFoundError("Model metadata file not found.")
            if not os.path.isfile(calibration_path):
                raise FileNotFoundError("Uncertainty calibration file not found.")

            # 2. Load and validate metadata
            with open(metadata_path, "r", encoding="utf-8") as f:
                self.metadata = json.load(f)

            saved_features = self.metadata.get("features", [])
            if saved_features != CANONICAL_FEATURES:
                raise ValueError(
                    f"Feature mismatch between canonical schema and metadata! "
                    f"Canonical ({len(CANONICAL_FEATURES)}) vs Saved ({len(saved_features)})."
                )

            # Extract model version if available in metadata
            self.model_version = self.metadata.get("model_version", "v0.1.0-alpha")

            # 3. Load XGBoost model
            self.model = xgb.XGBRegressor()
            self.model.load_model(model_path)

            # 4. Load Split Conformal Calibration
            with open(calibration_path, "r", encoding="utf-8") as f:
                self.calibration = json.load(f)

            intervals = self.calibration.get("intervals", {})
            self.q_hat_90 = float(intervals["nominal_coverage_90"]["q_hat_mm"])
            self.q_hat_80 = float(intervals["nominal_coverage_80"]["q_hat_mm"])

            self.is_ready = True
            self.error_message = None
            logger.info("Successfully loaded model and conformal calibration artifacts.")
            return True

        except Exception as e:
            self.is_ready = False
            self.error_message = f"Artifact loading failure: {str(e)}"
            logger.error("Failed to load ML artifacts: %s", str(e), exc_info=False)
            return False

    def predict(self, feature_dict: Dict[str, Any]) -> float:
        """
        Generates a non-negative precipitation prediction in mm/day.
        """
        if not self.is_ready or self.model is None:
            raise RuntimeError("Model is not loaded or service is not ready.")

        # Ensure exact canonical order
        feature_vector = np.array([[feature_dict[feat] for feat in CANONICAL_FEATURES]], dtype=np.float32)

        raw_pred = float(self.model.predict(feature_vector)[0])
        bounded_pred = max(0.0, raw_pred)
        return round(bounded_pred, 4)

    def predict_with_uncertainty(self, feature_dict: Dict[str, Any]) -> Dict[str, float]:
        """
        Generates precipitation prediction with split-conformal 80% and 90% prediction intervals.
        """
        if not self.is_ready or self.model is None or self.q_hat_80 is None or self.q_hat_90 is None:
            raise RuntimeError("Uncertainty artifacts are not loaded or service is not ready.")

        pred_mm = self.predict(feature_dict)

        lower_bound_80 = max(0.0, pred_mm - self.q_hat_80)
        upper_bound_80 = pred_mm + self.q_hat_80
        interval_width_80 = upper_bound_80 - lower_bound_80

        lower_bound_90 = max(0.0, pred_mm - self.q_hat_90)
        upper_bound_90 = pred_mm + self.q_hat_90
        interval_width_90 = upper_bound_90 - lower_bound_90

        return {
            "prediction_mm": round(pred_mm, 4),
            "lower_bound_80_mm": round(lower_bound_80, 4),
            "upper_bound_80_mm": round(upper_bound_80, 4),
            "lower_bound_90_mm": round(lower_bound_90, 4),
            "upper_bound_90_mm": round(upper_bound_90, 4),
            "interval_width_80_mm": round(interval_width_80, 4),
            "interval_width_90_mm": round(interval_width_90, 4)
        }

# Global singleton instance
model_state = ModelState()
