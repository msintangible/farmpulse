# FarmPulse

AI-powered field health monitoring MVP. FarmPulse uses an agentic Gemini workflow to detect vegetation anomalies, estimate financial impact, and write structured action plans to MongoDB.

## What it does

Given a selected field, FarmPulse:
1. Reads baseline NDVI data
2. Compares current vegetation snapshot
3. Pulls weather context
4. Reads crop price data
5. Estimates severity + financial impact
6. Writes an action plan to MongoDB

Target UX is a full analysis cycle in under 30 seconds.

## Architecture

### Frontend
- React 18 + Vite
- Tailwind CSS
- `react-leaflet` + `leaflet-draw`
- Zustand state, Axios API calls
- Landing/Demo, Farm Dashboard, Field Detail views
- Offline fallback via `demo_snapshot.json`

### Backend
- FastAPI (Python), Pydantic models
- Motor/PyMongo for MongoDB
- Shapely for centroid calculation (weather coordinates)
- Async analysis trigger + run-status polling pattern

### Database (MongoDB Atlas)
Main collections:
- `farms`
- `field_baselines`
- `vegetation_snapshots`
- `price_snapshots`
- `weather_snapshots`
- `action_plans`
- `audit_logs`

### Agent
- Gemini 1.5 Flash via Vertex AI
- Tool-based execution (not chatbot-style interaction)
- Deterministic 6-step sequence ending with action-plan write

#### Running the Gemini client locally
- Preferred package mode: `python -m backend.services.geminiclient`
- Direct script mode is also supported from `backend\services`: `python geminiclient.py`

## Agent flow

1. `get_field_baseline`
2. `get_vegetation_snapshot`
3. `get_weather`
4. `get_crop_prices`
5. Internal reasoning (cause, severity, impact)
6. `write_action_plan`

### NDVI severity thresholds
- Delta < `-0.05`: anomaly
- Delta < `-0.15`: severe anomaly
- Severity levels: `low | medium | high | critical`

### Simplified yield-loss model
- Low: 5%
- Medium: 15%
- High: 30%
- Critical: 50%

Default expected yields:
- Wheat: 7 t/ha
- Maize: 10 t/ha
- Potato: 35 t/ha
- Grass: 8 t/ha

## API surface (MVP)

All endpoints use static `X-API-Key` auth in MVP scope.

- `POST /api/v1/farms`
- `GET /api/v1/farms/{farm_id}`
- `POST /api/v1/farms/{farm_id}/fields`
- `GET /api/v1/farms/{farm_id}/fields`
- `POST /api/v1/fields/{field_id}/analyse`
- `GET /api/v1/fields/{field_id}/plans`
- `GET /api/v1/fields/{field_id}/plans/latest`
- `GET /api/v1/fields/{field_id}/snapshots`
- `GET /api/v1/demo/seed`
- `GET /api/v1/health`

## MVP constraints

- No live Sentinel-2 pull in MVP (precomputed/cached NDVI data)
- Crop prices are cached (not real-time market feed)
- Static API key auth (no OAuth/JWT)
- Atlas M0 free-tier limits
- Deterministic tool sequence (no dynamic branching)
- Simplified financial/yield model for demo reliability

## Deployment model

- **Backend:** Google Cloud Run (Docker; ADR-003)
- **Frontend:** Firebase Hosting (ADR-003)
- **Database:** MongoDB Atlas M0
- **Agent:** Vertex AI Gemini (2.5 Flash) via Google ADK (ADR-001)

Fallback paths are included for agent/database/network failure to preserve demo continuity.

## Post-MVP direction

Planned extensions include:
- Live Sentinel-2 integration
- Google Earth Engine NDVI pull
- Disease classification model integration
- SSE streaming for live agent steps
- Multi-farm support
- PDF export for action plans
