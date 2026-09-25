"""
health.py
Pydantic schemas for health and readiness probes.
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, List

class HealthResponse(BaseModel):
    status: str = Field(default="ok", description="Operational liveness indicator")
    service: str = Field(default="ml-service", description="Service identifier")
    version: str = Field(default="0.1.0", description="API service version")
    timestamp: str = Field(..., description="ISO 8601 timestamp")
    system_info: Optional[Dict[str, str]] = Field(default=None, description="System metadata")

class ReadyResponse(BaseModel):
    status: str = Field(default="ready", description="Model inference readiness status")
    service: str = Field(default="ml-service", description="Service identifier")
    model_loaded: bool = Field(..., description="XGBoost model file loaded")
    metadata_loaded: bool = Field(..., description="Model metadata loaded and schema verified")
    uncertainty_calibration_loaded: bool = Field(..., description="Split-conformal calibration quantiles loaded")
    model_version: str = Field(..., description="Active frozen model version")
    feature_count: int = Field(default=17, description="Number of approved model features")
    features: List[str] = Field(..., description="Canonical ordered feature list")
