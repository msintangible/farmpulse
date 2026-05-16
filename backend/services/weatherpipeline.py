from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from backend.services.weathermcp import store_weather
from backend.services.weathertool import get_weather


async def weather_pipeline(lat: float, lon: float):
    weather = await get_weather(lat, lon)
    await store_weather(weather)
    return weather
