# Panchayat Weather Intelligence & Agro-Meteorological Advisory System
### Smart India Hackathon 2026 Prototype

**Problem Statement:**
> *"Downscaling of weather forecast from Block level to Panchayat level: Inferring high-resolution plots/data/information from low-resolution plots/data/information/variables for agro-meteorological advisory services."*

---

## 1. System Architecture Overview

```
                      +-----------------------------+
                      |   Next.js React Frontend    | (Port 3000)
                      |  (Dashboard & MapLibre GIS) |
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      |    NestJS Backend API       | (Port 4000)
                      |  (Application Controller)   |
                      +-------+--------------+------+
                              |              |
                              v              v
            +--------------------+        +-------------------------+
            | PostgreSQL 16 +    |        | FastAPI ML Service      | (Port 8000)
            | PostGIS 3.4 DB     |        | (XGBoost + SHAP Engine) |
            | (Port 5432)        |        +-------------------------+
            +--------------------+
```

### The Downscaling Pipeline Concept
```
BLOCK-LEVEL WEATHER FORECAST (Coarse IMD/ERA5)
       +
PANCHAYAT SPATIAL FEATURES (Elevation, Land Cover, Lat/Lon)
       +
HISTORICAL WEATHER CHARACTERISTICS
       ↓
ML DOWNSCALING MODEL (XGBoost Tabular Supervised Regression)
       ↓
PANCHAYAT-LEVEL WEATHER PREDICTION
       ↓
VALIDATION (vs. Block Baseline) + UNCERTAINTY
       ↓
EXPLAINABILITY (SHAP Feature Importance)
       ↓
AGRO-METEOROLOGICAL ADVISORY ENGINE (Deterministic Agricultural Rules)
```

---

## 2. Monorepo Structure

```
panchayat-weather/
├── frontend/                     # Next.js 14 App Router, React, TypeScript, Tailwind CSS
│   ├── app/
│   │   ├── api/health/route.ts   # Frontend health check
│   │   ├── layout.tsx            # App root layout
│   │   ├── page.tsx              # Phase 1 diagnostic dashboard
│   │   └── globals.css           # Styling
│   ├── Dockerfile
│   └── package.json
│
├── backend/                      # NestJS application backend (TypeScript)
│   ├── src/
│   │   ├── database/             # PostgreSQL / PostGIS connection pool
│   │   ├── modules/health/       # Health check controller & probes
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── Dockerfile
│   └── package.json
│
├── ml-service/                   # Python FastAPI ML microservice
│   ├── app/
│   │   ├── routes/health.py      # Health & metadata probe
│   │   ├── schemas/              # Pydantic data schemas
│   │   └── main.py               # FastAPI entrypoint
│   ├── requirements.txt
│   └── Dockerfile
│
├── data/                         # Geospatial and weather datasets
│   ├── raw/                      # Raw IMD/ERA5/boundary files
│   ├── processed/                # Preprocessed ML-ready tables
│   └── sample/                   # Small study-area reference data
│
├── database/
│   ├── migrations/               # PostGIS SQL migrations
│   └── seed/                     # Seed data for blocks, panchayats, sample weather
│
├── docker-compose.yml            # Multi-service container orchestration
├── .env.example                  # Environment variable template
├── .env                          # Local environment configuration
└── README.md                     # System documentation
```

---

## 3. Microservice Endpoints & Port Allocation

| Service | Port | Health Check URL | Description |
|---|---|---|---|
| **Database** | `5432` | `pg_isready -U postgres` | PostgreSQL 16 with PostGIS spatial extensions |
| **ML Service** | `8000` | `http://localhost:8000/health` | FastAPI downscaling & SHAP inference service |
| **Backend** | `4000` | `http://localhost:4000/api/health` | NestJS REST API, PostGIS access & ML client |
| **Frontend** | `3000` | `http://localhost:3000/api/health` | Next.js GIS dashboard & advisory UI |

---

## 4. Running the System

### Option A: Using Docker Compose (Recommended)
Make sure Docker Desktop or Docker engine is running:

```bash
# 1. Build and start all services in the background
docker compose up -d --build

# 2. Check container status
docker compose ps

# 3. View logs
docker compose logs -f
```

### Option B: Local Development Setup

#### 1. ML Service (FastAPI)
```bash
cd ml-service
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 2. Backend (NestJS)
```bash
cd backend
npm install
npm run start:dev
```

#### 3. Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```

---

## 5. Incremental Development Roadmap

- [x] **Phase 1: Project Scaffolding & Health Verification** (Current)
  - Monorepo, Docker Compose, NestJS, FastAPI, Next.js, PostGIS configs, health endpoints.
- [ ] **Phase 2: Study Area & Sample Geospatial Data**
  - Define 1 Block with 5–20 Panchayats, GeoJSON boundaries, PostGIS ingestion.
- [ ] **Phase 3: Data Processing Pipeline**
  - Extract spatial features (elevation, centroid, historical norms) into ML-ready tabular dataset.
- [ ] **Phase 4: Baseline Model Implementation**
  - Block-as-Panchayat benchmark with evaluation metrics (MAE, RMSE, R²).
- [ ] **Phase 5: Supervised XGBoost Downscaling**
  - Train tabular regression model, chronological split, evaluate against baseline.
- [ ] **Phase 6: Model Versioning & Persistence**
  - Model artifacts, metadata, reproducible training manifest.
- [ ] **Phase 7: FastAPI Model Serving**
  - `/predict`, `/explain` endpoints with Pydantic validation.
- [ ] **Phase 8: NestJS End-to-End Backend Integration**
  - Database queries + FastAPI integration + REST endpoints.
- [ ] **Phase 9: Interactive Map Frontend**
  - MapLibre GL JS integration with Panchayat boundary polygons.
- [ ] **Phase 10: Downscaling UI Flow**
  - Panchayat selection → Block forecast → "Run Downscaling" CTA.
- [ ] **Phase 11: Validation Dashboard**
  - Visual baseline vs. ML comparison, Recharts actual vs. predicted curves.
- [ ] **Phase 12: SHAP Explainability & Uncertainty Display**
  - Feature contribution charts and prediction interval bands.
- [ ] **Phase 13: Rule-Based Agro-Meteorological Advisory Engine**
  - Crop-specific deterministic rules based on downscaled weather.
- [ ] **Phase 14: End-to-End System Testing & Verification**
- [ ] **Phase 15: Government-Grade UI Polish & Hackathon Demo Rehearsal**
