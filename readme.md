# FRA Atlas — AI-Powered WebGIS & Decision Support System

An integrated monitoring platform for **Forest Rights Act (FRA), 2006** implementation, built for the Ministry of Tribal Affairs. Combines a district-level risk atlas, interactive WebGIS, a forest-fire early-warning module, and a water-aware crop recommender — all in one React application.

**Priority states:** Madhya Pradesh · Tripura · Odisha · Telangana
**Design language:** india.gov.in inspired (Tiranga saffron/navy/green, Noto Sans/Serif)

---

## Table of Contents

- [What this is](#what-this-is)
- [Modules](#modules)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Module details](#module-details)
  - [1. FRA Risk Dashboard & Atlas Map](#1-fra-risk-dashboard--atlas-map)
  - [2. Decision Support System (DSS)](#2-decision-support-system-dss)
  - [3. Analytics](#3-analytics)
  - [4. Fire Alert — 7-Day Forecast](#4-fire-alert--7-day-forecast)
  - [5. Crop Recommender](#5-crop-recommender)
- [Data pipeline](#data-pipeline)
- [Backend integration](#backend-integration)
- [Updating data when models re-run](#updating-data-when-models-re-run)
- [Known limitations & honest caveats](#known-limitations--honest-caveats)
- [Roadmap](#roadmap)

---

## What this is

Three ML-driven problems, one frontend:

| Problem | Model output consumed | Page |
|---|---|---|
| FRA claim-processing risk across districts | K-Means clustering + PCA + risk index (CSV + charts) | Dashboard, Map, Analytics, DSS |
| Forest fire early warning | Random Forest / XGBoost / Ensemble / LSTM classifiers (CSV + ROC/PR curves) | Fire Alert |
| Crop suitability for FRA patta-holder land | Deterministic agronomy rule engine, ML-scoring-ready (FastAPI service) | Crop Recommender |

Each module was integrated **from real model outputs** — CSVs, evaluation charts, and (for crops) a documented API contract — not from placeholder data.

---

## Modules

```
┌─────────────────────────────────────────────────────────────┐
│                        FRA Atlas (React SPA)                 │
├───────────────┬───────────────┬──────────────┬──────────────┤
│  Dashboard /   │  Fire Alert   │  Crop         │  Reports      │
│  Map / DSS /   │  /fire        │  Recommender  │  /reports     │
│  Analytics     │               │  /crops       │               │
├───────────────┴───────────────┴──────────────┴──────────────┤
│ FRA risk data   │ Fire forecast  │ Crop rule engine (JS) ──┐  │
│ (static JSON,   │ (static JSON,  │  ↕ falls back to ↕      │  │
│  500 districts) │  280 records)  │ FastAPI /recommend ─────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | React 19 + Vite |
| Routing | React Router v6 |
| Charts | Recharts |
| Maps | Leaflet + react-leaflet + react-leaflet-cluster |
| Icons | lucide-react |
| Crop backend (optional) | FastAPI (Python), bundled under `backend/` |

No CSS framework — a hand-built design system in `src/index.css` + per-page CSS files, styled after india.gov.in.

---

## Project structure

```
fra-atlas/
├── backend/
│   └── crop-recommender/          # FastAPI service (optional, has offline fallback)
│       ├── src/croprec/           # engine.py, water.py, api.py, knowledge_base.py
│       ├── data/crops.yaml        # 18-crop agronomic knowledge base
│       ├── API_CONTRACT.md        # frontend/backend integration contract
│       └── requirements.txt
├── public/
│   └── images/                    # ML output charts (heatmap, PCA, ranking, ROC/PR, feature importance)
├── scripts/
│   ├── gen_data.py                # regenerate fraData.js from FRA risk CSV
│   └── gen_fire_data.py           # regenerate fireData.js from fire forecast CSV
├── src/
│   ├── components/layout/         # Layout, Panel, RiskBadge (shared UI)
│   ├── data/
│   │   ├── fraData.js             # 500 FRA districts (auto-generated)
│   │   ├── fireData.js            # 280 fire forecasts, 7 days × 40 locations (auto-generated)
│   │   ├── cropKnowledgeBase.js   # 18 crops (mirrors backend crops.yaml)
│   │   └── constants.js           # colors, state lists, scheme definitions
│   ├── utils/
│   │   ├── cropApi.js             # FastAPI client with offline fallback + timeout
│   │   └── cropEngine.js          # JS port of the rule engine (fallback scorer)
│   ├── pages/
│   │   ├── Dashboard.jsx          # /        — hero, KPIs, charts, top-risk table
│   │   ├── MapPage.jsx            # /map     — Leaflet WebGIS, clustering, filters
│   │   ├── Analytics.jsx          # /analytics — ML charts, live Recharts comparisons
│   │   ├── DSS.jsx                # /dss     — CSS scheme eligibility engine
│   │   ├── FireForecast.jsx       # /fire    — 7-day fire risk map + timeline
│   │   ├── CropRecommender.jsx    # /crops   — crop scoring form + map
│   │   └── Reports.jsx            # /reports — export cards, pipeline status
│   ├── App.jsx                    # router
│   └── main.jsx                   # entry point
└── package.json
```

---

## Getting started

```bash
npm install
npm run dev        # → http://localhost:5173
npm run build       # production build → dist/
npm run preview     # serve the production build locally
```

**Optional — enable live crop scoring:**
```bash
cd backend/crop-recommender
pip install -r requirements.txt
uvicorn croprec.api:app --reload --app-dir src
# → http://127.0.0.1:8000  (interactive docs at /docs)
```
The Crop Recommender page works with or without this running — see [Module 5](#5-crop-recommender).

---

## Module details

### 1. FRA Risk Dashboard & Atlas Map

**Data source:** `fra_risk_scores.csv` → 500 districts across 16 states, each with a Risk Index (K-Means cluster + composite score), Risk Level (Critical/Moderate/Good/Excellent), and 8 underlying factors (approval rate, pending claims rate, avg processing time, forest loss rate, tribal population coverage, CFR recognition rate, rejection rate, encroachment density).

- **`/` Dashboard** — animated KPI counters, risk distribution donut, state-wise stacked bar, top-15 high-risk table, focused-state cards, mini-map preview, critical alert digest.
- **`/map` FRA Atlas Map** — full-screen Leaflet map, all 500 districts as clustered circle markers colored by risk, filter toolbar (risk level / state / free-text search / basemap switch), click-to-inspect side panel with all 8 metrics, deep-links into DSS.

### 2. Decision Support System (DSS)

**`/dss`** — given a state + district, layers Central Sector Scheme (CSS) eligibility on top of the FRA risk profile: PM-KISAN, Jal Jeevan Mission, MGNREGA, PMAY-G, SAUBHAGYA, Van Bandhu Kalyan Yojana, and others. Generates a priority action plan (Immediate / Short-term / Medium-term) driven by the district's actual pending-claims rate, processing time, and forest-loss figures. Includes a DAJGUA 3-ministry convergence panel (Environment / Tribal Affairs / Agriculture).

### 3. Analytics

**`/analytics`** — embeds the ML team's evaluation charts (factor correlation heatmap, PCA cluster scatter, risk ranking) alongside **live** Recharts visualizations computed from the same dataset: a switchable state-metric bar chart (6 metrics) and a 500-point scatter of Risk Index vs. Approval Rate, colored by risk level.

### 4. Fire Alert — 7-Day Forecast

**Data source:** `fire_forecast_7day.csv` → 280 records (40 monitored locations × 7 days, 24–30 June), each with a fire probability and risk level (High/Medium/Low), covering central India (MP / Telangana / Odisha region).

**`/fire`** — fully static, no backend required:
- Interactive Leaflet map, circle size proportional to fire probability, colored by risk
- **7-day timeline scrubber** with ▶ Play/Pause animation
- Risk-level filter, per-location popups, top-8 highest-risk list with click-to-fly-to
- 7-day trend line chart (High/Medium/Low zone counts per day)
- **Model performance panel**: comparison table (RandomForest / XGBoost / Ensemble / LSTM — ROC-AUC 0.67–0.70, PR-AUC 0.64–0.67), a live feature-importance bar chart (LST, day-of-year, NDVI, month, rainfall, wind speed, forest cover), and the original ROC/PR curve images from the training notebook

### 5. Crop Recommender

**Data source:** `backend/crop-recommender/data/crops.yaml` — an 18-crop pan-India agronomic knowledge base (FAO-56 water requirement ranges, ICAR package-of-practices), plus a documented FastAPI contract (`API_CONTRACT.md`).

**`/crops`** — a district-conditions form (rainfall, temperature, irrigation cover, groundwater status, soil type, season) returns a ranked, explained list of suitable crops:

- Scores 0–100 per crop, built from water-budget match, groundwater-sustainability penalty (scaled by crop water intensity), soil compatibility, season match, and temperature suitability
- Each recommendation includes a ✓/✕ reasons list (e.g. *"Penalised −8: low-water crop in critical block"*)
- A groundwater-colored district map for quick selection
- **Live/offline status pill**: calls `POST /recommend` on the FastAPI backend when reachable; otherwise transparently falls back to a faithful JS port of the same scoring logic (`src/utils/cropEngine.js`), so the page never breaks in a demo without the backend running
- `used_ml: true` / `ml_score` fields are wired through and will populate automatically once a trained ML model (`models/model.joblib`) is added on the backend — **no frontend change needed**

> **Naming note:** this is a rule-based *recommendation* engine (ranks which crops suit a district), not a numeric *yield-prediction* model (it does not output tons/hectare). The API contract explicitly reserves an `ml_score` slot for a future trained model — that's the natural place a yield regressor would plug in.

---

## Data pipeline

```
ML training (Colab / notebook)
        │
        ├── fra_risk_scores.csv ─────────► scripts/gen_data.py ─────► src/data/fraData.js
        ├── fire_forecast_7day.csv ──────► scripts/gen_fire_data.py ─► src/data/fireData.js
        ├── factor_heatmap.png ──────────► public/images/
        ├── pca_clusters.png ────────────► public/images/
        ├── risk_ranking.png ────────────► public/images/
        ├── feature_importance.png ──────► public/images/fire_feature_importance.png
        ├── roc_curves.png ──────────────► public/images/fire_roc_curves.png
        ├── pr_curves.png ───────────────► public/images/fire_pr_curves.png
        └── crops.yaml ──────────────────► backend/crop-recommender/data/
                                                  (served live via FastAPI, or
                                                   mirrored in src/data/cropKnowledgeBase.js
                                                   for the offline fallback)
```

All three data feeds are **pre-baked into static JS at build time** except the crop recommender, which prefers a live API call and only falls back to static logic when the service is unreachable.

---

## Backend integration

This is a **frontend-only deliverable** designed to slot into any backend:

- **Django**: build (`npm run build`) and serve `dist/` as a template, mount your API under `/api/` — see the FRA-specific Django `views.py`/`urls.py` pattern if you're running the earlier Django variant of this project.
- **FastAPI** (crop module only): already bundled and documented — see `backend/crop-recommender/API_CONTRACT.md`.
- **CORS**: the crop FastAPI service has CORS wide open in dev (`allow_origins=["*"]`) — lock this to your real origin before production.

---

## Updating data when models re-run

```bash
# FRA risk scores
python3 scripts/gen_data.py path/to/fra_risk_scores.csv

# Fire forecast
python3 scripts/gen_fire_data.py path/to/fire_forecast_7day.csv

# Then rebuild
npm run build
```

For the crop knowledge base, edit `backend/crop-recommender/data/crops.yaml` directly — the live API will serve it immediately, and `src/data/cropKnowledgeBase.js` should be regenerated to keep the offline fallback in sync (a `gen_crop_kb.py` script can be added following the same pattern as the two scripts above).

Updated ML chart images (heatmap, PCA, ranking, ROC/PR, feature importance) just need to be dropped into `public/images/` with matching filenames.

---

## Known limitations & honest caveats

- **Fire forecast dates are fixed** (24–30 June 2024) in the current CSV — the timeline will need live re-ingestion to stay current in production.
- **District coordinates** for the FRA map and crop districts use a curated centroid lookup (`DISTRICT_COORDS` in `constants.js`), not official administrative boundary polygons. A production GIS layer should swap in real boundaries (e.g. DataMeet/GADM shapefiles).
- **Crop Recommender demo districts** are the 5–7 sample points from the backend's own prototype (`web/index.html`), not a full district list — extend `CROP_DISTRICTS` in `constants.js` for full coverage.
- **No yield prediction.** As noted above, the crop module ranks suitability; it doesn't forecast tons/hectare. If a yield regressor exists in the (currently inaccessible) Colab notebook, it would need its own endpoint and a new results panel — flag this if you want it added once the notebook is shared in a readable form.
- **Water-budget coefficients** (effective rainfall fraction, max irrigation supplement) are FAO-56 planning defaults, explicitly flagged as uncalibrated in the backend source — see `water.py`'s own docstring.

---

## Roadmap

- [ ] Real district boundary polygons (choropleth instead of point markers)
- [ ] Live fire-data re-ingestion pipeline (replace static CSV with a scheduled job)
- [ ] Crop yield regression model + dedicated `/yield` endpoint, once available
- [ ] Authentication / role-based views for state nodal officers vs. central MoTA staff
- [ ] Export-to-PDF for DSS action plans and fire alerts