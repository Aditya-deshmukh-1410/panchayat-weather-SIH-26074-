"""
predict.py
Pydantic schemas for feature payload validation and inference responses.
"""

import math
from typing import Dict, Any
from pydantic import BaseModel, Field, ConfigDict, field_validator

class PredictionRequest(BaseModel):
    """
    Validated 17-feature input payload for Panchayat-level precipitation downscaling.
    All features must correspond strictly to the approved non-leaking schema.
    """
    model_config = ConfigDict(
        extra="forbid",
        json_schema_extra={
            "example": {
                "block_rainfall": 5.62,
                "block_temp_max": 28.5,
                "block_temp_min": 21.0,
                "block_humidity": 85.0,
                "block_wind_speed": 3.2,
                "latitude": 18.27524,
                "longitude": 74.37465,
                "elevation_m": 598.0,
                "area_sqkm": 13.56,
                "dist_to_block_center_km": 21.4,
                "rainfall_lag_1d": 2.5,
                "rainfall_lag_2d": 0.0,
                "rainfall_lag_3d": 1.2,
                "rainfall_rolling_7d_mean": 4.1,
                "rainfall_rolling_7d_max": 12.0,
                "day_of_year": 245,
                "month": 9
            }
        }
    )

    # Coarse Block Inputs (5)
    block_rainfall: float = Field(..., ge=0.0, le=1000.0, description="Coarse block precipitation (mm/day)")
    block_temp_max: float = Field(..., ge=-20.0, le=65.0, description="Coarse maximum temperature (°C)")
    block_temp_min: float = Field(..., ge=-30.0, le=55.0, description="Coarse minimum temperature (°C)")
    block_humidity: float = Field(..., ge=0.0, le=100.0, description="Coarse relative humidity (%)")
    block_wind_speed: float = Field(..., ge=0.0, le=150.0, description="Coarse wind speed (m/s)")

    # Spatial Characteristics (5)
    latitude: float = Field(..., ge=-90.0, le=90.0, description="Panchayat centroid latitude (°N)")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="Panchayat centroid longitude (°E)")
    elevation_m: float = Field(..., ge=-500.0, le=9000.0, description="Surface elevation in meters above sea level")
    area_sqkm: float = Field(..., gt=0.0, le=10000.0, description="Panchayat administrative boundary area (km²)")
    dist_to_block_center_km: float = Field(..., ge=0.0, le=1000.0, description="Geodesic distance to block centroid (km)")

    # Antecedent Historical Lags strictly <= t-1 (5)
    rainfall_lag_1d: float = Field(..., ge=0.0, le=1000.0, description="Localized reference rainfall at day t-1 (mm)")
    rainfall_lag_2d: float = Field(..., ge=0.0, le=1000.0, description="Localized reference rainfall at day t-2 (mm)")
    rainfall_lag_3d: float = Field(..., ge=0.0, le=1000.0, description="Localized reference rainfall at day t-3 (mm)")
    rainfall_rolling_7d_mean: float = Field(..., ge=0.0, le=1000.0, description="Antecedent 7-day rolling mean rainfall (mm)")
    rainfall_rolling_7d_max: float = Field(..., ge=0.0, le=1000.0, description="Antecedent 7-day rolling max rainfall (mm)")

    # Calendar Features (2)
    day_of_year: int = Field(..., ge=1, le=366, description="Ordinal day of year (1-366)")
    month: int = Field(..., ge=1, le=12, description="Calendar month (1-12)")

    @field_validator(
        "block_rainfall", "block_temp_max", "block_temp_min", "block_humidity", "block_wind_speed",
        "latitude", "longitude", "elevation_m", "area_sqkm", "dist_to_block_center_km",
        "rainfall_lag_1d", "rainfall_lag_2d", "rainfall_lag_3d", "rainfall_rolling_7d_mean",
        "rainfall_rolling_7d_max", mode="before"
    )
    @classmethod
    def validate_non_finite_floats(cls, v: Any) -> float:
        if isinstance(v, (int, float)):
            if math.isnan(v) or math.isinf(v):
                raise ValueError("NaN and Infinity values are strictly forbidden.")
        return v

    def to_dict(self) -> Dict[str, Any]:
        """Convert validated request fields to dictionary."""
        return self.model_dump()


class PredictionResponse(BaseModel):
    """
    Downscaled precipitation prediction response.
    """
    prediction_mm: float = Field(..., ge=0.0, description="Predicted downscaled rainfall (mm/day, non-negative)")
    model_version: str = Field(..., description="Active XGBoost model version")
    target: str = Field(default="daily_precipitation_mm", description="Target meteorological variable")
    reference_type: str = Field(default="ERA5-Land_reference_proxy", description="Reference proxy provenance")


class PredictionWithUncertaintyResponse(BaseModel):
    """
    Downscaled precipitation prediction with Split Conformal Prediction intervals.
    """
    prediction_mm: float = Field(..., ge=0.0, description="Point prediction (mm/day, non-negative)")
    lower_bound_80_mm: float = Field(..., ge=0.0, description="Split-conformal 80% lower bound (mm/day)")
    upper_bound_80_mm: float = Field(..., description="Split-conformal 80% upper bound (mm/day)")
    lower_bound_90_mm: float = Field(..., ge=0.0, description="Split-conformal 90% lower bound (mm/day)")
    upper_bound_90_mm: float = Field(..., description="Split-conformal 90% upper bound (mm/day)")
    interval_width_80_mm: float = Field(..., ge=0.0, description="Width of the 80% conformal interval (mm/day)")
    interval_width_90_mm: float = Field(..., ge=0.0, description="Width of the 90% conformal interval (mm/day)")
    model_version: str = Field(..., description="Active XGBoost model version")
    uncertainty_method: str = Field(default="split_conformal_prediction", description="Statistical uncertainty method")
