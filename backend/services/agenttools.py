from typing import Any

from weatherpipeline import weather_pipeline


TOOL_SPECS = {
    "get-weather": {
        "purpose": "Retrieve a 24-hour temperature snapshot for a location and persist it.",
        "inputs": {
            "latitude": "float",
            "longitude": "float",
        },
        "output": "weather snapshot dictionary with coordinates and temperatures",
    }
}


async def execute_tool(tool_name: str, args: dict[str, Any]):
    if tool_name == "get-weather":
        if "latitude" not in args or "longitude" not in args:
            raise ValueError("get-weather requires 'latitude' and 'longitude'.")

        weather = await weather_pipeline(
            float(args["latitude"]),
            float(args["longitude"])
        )
        return weather

    raise ValueError(f"Unknown tool: {tool_name}")
