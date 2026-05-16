from contextlib import asynccontextmanager
from pathlib import Path
import sys

from fastapi import FastAPI
import uvicorn

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
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
    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8003, reload=True)
