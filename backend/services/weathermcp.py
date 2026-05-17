from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from backend.services.mcp_client import mcp_client


async def store_weather(weather_data: dict):
    return await mcp_client.call_tool("insert-many", {
        "database": "mcp_demo_db",
        "collection": "weather_snapshots",
        "documents": [weather_data]
    })
