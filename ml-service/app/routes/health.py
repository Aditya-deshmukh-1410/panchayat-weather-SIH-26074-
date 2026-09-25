"""
health.py
Health and Readiness probes for container orchestrator, backend proxy, and monitoring.
"""

from fastapi import APIRouter, HTTPException, status
from datetime import datetime, timezone
import platform
import sys
from app.schemas.health import HealthResponse, ReadyResponse
from app.core.model_state import model_state
from app.core.config import CANONICAL_FEATURES

router = APIRouter(tags=["Health & Readiness"])

@router.get("/health", response_model=HealthResponse)
def get_health() -> HealthResponse:
    """
    Liveness probe verifying that the FastAPI web service process is active.
    """
    return HealthResponse(
        status="ok",
        service="ml-service",
        version="0.1.0",
        timestamp=datetime.now(timezone.utc).isoformat(),
        system_info={
            "python_version": sys.version.split()[0],
            "platform": platform.system(),
            "architecture": platform.machine()
        }
    )

@router.get("/ready", response_model=ReadyResponse)
def get_ready() -> ReadyResponse:
    """
    Readiness probe verifying that the frozen XGBoost model, metadata,
    and split-conformal uncertainty calibration artifacts are loaded into memory.
    """
    if not model_state.is_ready or model_state.model is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "status": "not_ready",
                "service": "ml-service",
                "error": model_state.error_message or "Model artifacts have not been initialized."
            }
        )

    return ReadyResponse(
        status="ready",
        service="ml-service",
        model_loaded=model_state.model is not None,
        metadata_loaded=bool(model_state.metadata),
        uncertainty_calibration_loaded=(model_state.q_hat_80 is not None and model_state.q_hat_90 is not None),
        model_version=model_state.model_version,
        feature_count=len(CANONICAL_FEATURES),
        features=CANONICAL_FEATURES
    )
