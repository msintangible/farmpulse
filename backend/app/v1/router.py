"""Aggregate router for the v1 API. Mounted under /api/v1 in backend.main."""

from fastapi import APIRouter

from backend.app.v1.endpoints import demo, health

api_v1_router = APIRouter()
api_v1_router.include_router(health.router, tags=["health"])
api_v1_router.include_router(demo.router, prefix="/demo", tags=["demo"])
