"""
main.py
FastAPI application entry point for the Panchayat Weather ML Service.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import uvicorn

from app.core.model_state import model_state
from app.routes.health import router as health_router
from app.routes.predict import router as predict_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifecycle event handler to load model artifacts on startup.
    """
    # Load model, metadata, and uncertainty calibration once on startup
    model_state.load_artifacts()
    yield
    # Cleanup if needed

app = FastAPI(
    title="Panchayat Weather Intelligence - ML Inference Service",
    description=(
        "Microservice providing deterministic spatial downscaling of coarse block-scale "
        "meteorological inputs to Gram Panchayat-level daily precipitation using a frozen "
        "XGBoost regressor. Includes distribution-free Split Conformal Prediction intervals.\n\n"
        "**Scientific Boundary Notice**: Target is ERA5-Land (0.1° reanalysis reference proxy), "
        "not physical rain-gauge ground truth. Current service executes historical spatial "
        "downscaling and is not yet coupled to an operational numerical weather prediction feed."
    ),
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for backend proxy and dashboard consumption
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register endpoints
app.include_router(health_router)
app.include_router(predict_router)

@app.get("/", tags=["Root"])
def root():
    return {
        "service": "Panchayat Weather ML Inference Service",
        "status": "online",
        "documentation": "/docs",
        "health": "/health",
        "readiness": "/ready"
    }

if __name__ == "__main__":
    port = int(os.getenv("ML_SERVICE_PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=False)
