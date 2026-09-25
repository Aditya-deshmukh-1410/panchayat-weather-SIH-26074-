"""
predict.py
Endpoints for deterministic precipitation downscaling and conformal uncertainty intervals.
"""

from fastapi import APIRouter, HTTPException, status
from app.schemas.predict import (
    PredictionRequest,
    PredictionResponse,
    PredictionWithUncertaintyResponse
)
from app.core.model_state import model_state

router = APIRouter(tags=["Inference & Uncertainty"])

@router.post(
    "/predict",
    response_model=PredictionResponse,
    summary="Generate downscaled Panchayat precipitation prediction",
    description=(
        "Accepts the 17 approved meteorological, spatial, and antecedent lag features "
        "and generates a non-negative daily precipitation estimate (mm/day) using the "
        "frozen XGBoost downscaling model trained on Baramati Block."
    )
)
def predict_precipitation(payload: PredictionRequest) -> PredictionResponse:
    """
    Generate deterministic downscaled precipitation prediction.
    """
    if not model_state.is_ready:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model is not ready. Verify /ready status before sending inference requests."
        )

    try:
        prediction_mm = model_state.predict(payload.to_dict())
        return PredictionResponse(
            prediction_mm=prediction_mm,
            model_version=model_state.model_version,
            target="daily_precipitation_mm",
            reference_type="ERA5-Land_reference_proxy"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference error encountered: {str(e)}"
        )


@router.post(
    "/predict-with-uncertainty",
    response_model=PredictionWithUncertaintyResponse,
    summary="Generate downscaled precipitation with Split-Conformal intervals",
    description=(
        "Accepts the 17 approved features and returns the point prediction alongside "
        "statistically grounded 80% and 90% split-conformal prediction intervals, "
        "calibrated against the validation partition. Lower bounds are non-negative."
    )
)
def predict_with_uncertainty(payload: PredictionRequest) -> PredictionWithUncertaintyResponse:
    """
    Generate precipitation prediction with pre-calibrated split-conformal prediction intervals.
    """
    if not model_state.is_ready:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model or uncertainty artifacts not ready. Verify /ready status."
        )

    try:
        res = model_state.predict_with_uncertainty(payload.to_dict())
        return PredictionWithUncertaintyResponse(
            **res,
            model_version=model_state.model_version,
            uncertainty_method="split_conformal_prediction"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference or uncertainty calculation error: {str(e)}"
        )
