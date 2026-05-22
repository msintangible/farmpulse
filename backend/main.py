from contextlib import asynccontextmanager

from fastapi import FastAPI
import uvicorn

from backend.app.v1.router import api_v1_router
from backend.database.mongodb import ping_mongodb


@asynccontextmanager
async def lifespan(_: FastAPI):
    ping_mongodb()
    yield


app = FastAPI(
    title="FarmPulse API",
    description="Backend API for FarmPulse",
    version="1.0.0",
    lifespan=lifespan,
)


@app.get("/")
async def root() -> dict[str, str]:
    return {"message": "FarmPulse API is running"}


@app.get("/health")
async def health_check() -> dict[str, str]:
    """Cheap liveness probe. Dependency readiness lives at /api/v1/health."""
    return {"status": "ok"}


app.include_router(api_v1_router, prefix="/api/v1")


if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8003, reload=True)
