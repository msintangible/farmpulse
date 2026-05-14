import os
from pathlib import Path
import asyncio
from dotenv import load_dotenv
from google import genai
from mcp_client import mcp_client
import sys

load_dotenv(Path(__file__).resolve().parents[1] / ".env")


client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))




TOOLS_PROMPT = """
You are an AI agent with access to a MongoDB tool.

You can use:

insert-many(database, collection, documents)

If you want to use a tool, respond EXACTLY like this:

TOOL: insert-many
{
  "database": "test",
  "collection": "users",
  "documents": [
    {
      "name": "johny Doe",
      "email": "johny@test.com"
    }
  ]
}

If no tool is needed, just answer normally.
"""

def parse_tool(text: str):
    if "TOOL:" not in text:
        return None, None

    lines = text.split("\n")
    tool = lines[0].replace("TOOL:", "").strip()

    import json
    args = json.loads("\n".join(lines[1:]))

    return tool, args


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

        print("\nExecuting MCP tool:", tool)

        # 3. Call MCP
        result = await mcp_client.call_tool(tool, args)

        print("\nMCP result:\n", result)

        return result

    return text


async def main():

    print("Connecting MCP...")
    await mcp_client.connect()
    print("Connected!\n")

    prompt = "Create a user named Johnnyyy Downsyndorome with email john@test.com"

    result = await run_agent(prompt)

    print("\nFINAL OUTPUT:\n", result)

    await mcp_client.close()


if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
