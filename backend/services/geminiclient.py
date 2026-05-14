import os
from pathlib import Path
import asyncio
from dotenv import load_dotenv
from google import genai

from weatherpipeline import weather_pipeline

from mcp_client import mcp_client
import sys

load_dotenv(Path(__file__).resolve().parents[1] / ".env")


client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))



TOOLS_PROMPT = """
You are an AI agent with access to tools.

TOOLS:

1. insert-many(database, collection, documents)

2. get-weather(latitude, longitude)

RULE:
Always use TOOL format if calling tools.

Example:

TOOL: get-weather
{
  "latitude": 55.07,
  "longitude": -7.36
}
"""

def parse_tool(text: str):
    if "TOOL:" not in text:
        return None, None

    lines = text.split("\n")
    tool = lines[0].replace("TOOL:", "").strip()

    import json
    args = json.loads("\n".join(lines[1:]))

    return tool, args
async def execute_tool(tool_name, args):
    # 1. MongoDB tools go to MCP
    if tool_name in ["insert-many", "find", "list-databases"]:
        return await mcp_client.call_tool(tool_name, args)

    # 2. Weather tool is custom (NOT MCP)
    if tool_name == "get-weather":
        weather = await  weather_pipeline(
            args["latitude"],
            args["longitude"]
        )
        return weather

    # 3. fallback
    raise ValueError(f"Unknown tool: {tool_name}")

async def run_agent(prompt: str):

    # 1. Ask Gemini
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=TOOLS_PROMPT + "\n\nUser: " + prompt
    )

    text = response.text
    print("\nGemini output:\n", text)

    # 2. Parse tool call
    tool, args = parse_tool(text)

    if tool:

        print("\nExecuting tool:", tool)

        # 3. Call MCP
        result = await execute_tool(tool, args)

        print("\nMCP result:\n", result)

        return result

    return text


async def main():

    print("Connecting MCP...")
    await mcp_client.connect()
    print("Connected!\n")

    prompt = "Get the weather for London and store it in the database."
    try:
        result = await run_agent(prompt)
        print("\nFINAL OUTPUT:\n", result)
    finally:
        await mcp_client.close()


if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
