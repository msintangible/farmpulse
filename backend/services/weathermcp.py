from backend.core.settings import DB_NAME
from backend.services.mcp_client import mcp_client


async def store_weather(weather_data: dict):
    return await mcp_client.call_tool("insert-many", {
        "database": DB_NAME,
        "collection": "weather_snapshots",
        "documents": [weather_data]
    })
