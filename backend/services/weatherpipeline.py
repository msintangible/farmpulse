from weathermcp import store_weather
from weathertool import get_weather


async def weather_pipeline(lat: float, lon: float):
    weather = await get_weather(lat, lon)
    await store_weather(weather)
    return weather
