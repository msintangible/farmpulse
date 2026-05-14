from fastapi import FastAPI
import uvicorn


app = FastAPI(
    title="FarmPulse API",
    description="Backend API for FarmPulse",
    version="1.0.0",
)


@app.get("/")
async def root() -> dict[str, str]:
    return {"message": "FarmPulse API is running"}


@app.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8003, reload=True)
