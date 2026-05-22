"""Health / readiness endpoint (BE-2, PROJECT_PLAN Week 1 Day 6-7).

`GET /api/v1/health` reports dependency readiness:
- MongoDB Atlas reachability (a `ping`)
- Vertex AI readiness (Application Default Credentials resolve + a project)

The Vertex check is deliberately a credential/configuration check, not a model
call: a health probe must be cheap and must never spend Vertex AI credits.
"""

from fastapi import APIRouter
from fastapi.concurrency import run_in_threadpool

from backend.core.settings import GOOGLE_CLOUD_PROJECT
from backend.database.mongodb import ping_mongodb

router = APIRouter()


def _check_mongodb() -> dict:
    try:
        ping_mongodb()
        return {"status": "ok"}
    except Exception as exc:  # noqa: BLE001 — health check must never raise
        return {"status": "error", "detail": str(exc)}


def _check_vertex() -> dict:
    try:
        import google.auth
        from google.auth.exceptions import DefaultCredentialsError

        try:
            _creds, project = google.auth.default(
                scopes=["https://www.googleapis.com/auth/cloud-platform"]
            )
        except DefaultCredentialsError as exc:
            return {"status": "error", "detail": f"No Application Default Credentials: {exc}"}

        project = project or GOOGLE_CLOUD_PROJECT
        if not project:
            return {
                "status": "degraded",
                "detail": "ADC present but no project resolved (set GOOGLE_CLOUD_PROJECT).",
            }
        return {"status": "ok", "project": project}
    except ImportError:
        return {"status": "error", "detail": "google-auth not installed"}
    except Exception as exc:  # noqa: BLE001 — health check must never raise
        return {"status": "error", "detail": str(exc)}


def _health_sync() -> dict:
    checks = {"mongodb_atlas": _check_mongodb(), "vertex_ai": _check_vertex()}
    overall = "ok" if all(c["status"] == "ok" for c in checks.values()) else "degraded"
    return {"status": overall, "checks": checks}


@router.get("/health", summary="Dependency readiness: MongoDB Atlas + Vertex AI")
async def health() -> dict:
    return await run_in_threadpool(_health_sync)
