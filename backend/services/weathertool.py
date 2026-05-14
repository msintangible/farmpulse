import openmeteo_requests
import requests_cache
from retry_requests import retry

cache_session = requests_cache.CachedSession('.cache', expire_after=3600)
retry_session = retry(cache_session, retries=5, backoff_factor=0.2)
client = openmeteo_requests.Client(session=retry_session)
async def get_weather(latitude: float, longitude: float):
    url = "https://api.open-meteo.com/v1/forecast"

    params = {
        "latitude": latitude,
        "longitude": longitude,
        "hourly": "temperature_2m",
    }

    responses = client.weather_api(url, params=params)
    response = responses[0]

    hourly = response.Hourly()
    temps = hourly.Variables(0).ValuesAsNumpy()

    return {
        "latitude": latitude,
        "longitude": longitude,
        "temperatures": temps[:24].tolist()  # keep it small for test
    }