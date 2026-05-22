import asyncio
import json
import sys
from pathlib import Path


from google import genai



sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
# DEPRECATED: the API-key Gemini path is replaced by Vertex AI via Google ADK
# (ADR-001); removing this whole module is BE-1's migration. The key is read
# from the env locally so it no longer couples to core.settings — the only
# remaining gemini-API-key reference in the codebase (gate criterion 5).
import os
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
from backend.services.agenttools import execute_tool, TOOL_SPECS
from backend.services.mcp_client import mcp_client


client = genai.Client(api_key=GEMINI_API_KEY)


SYSTEM_PROMPT = """
You are FarmPulse Agent, an agentic AI system for agriculture.

Mission:
- Monitor agricultural fields.
- Use tools to gather evidence.
- Produce a structured action plan grounded in tool outputs.

Behavior rules:
1. You must reason as a planner/executor, not a chatbot.
2. If a tool is needed, return a tool_call decision.
3. You may execute multiple tool calls over multiple steps.
4. Only use tools that exist in TOOL_CATALOG.
5. After enough evidence is gathered, return a final decision with an action plan.

Output contract:
Return ONLY valid JSON with one of these shapes:

{
  "type": "tool_call",
  "tool_name": "get-weather",
  "arguments": {
    "latitude": 51.5074,
    "longitude": -0.1278
  },
  "reason": "Why this tool is needed next"
}

OR

{
  "type": "final",
  "result": {
    "summary": "short explanation",
    "risk_level": "low|medium|high",
    "action_plan": [
      "step 1",
      "step 2"
    ],
    "evidence": {
      "weather": "facts from tool outputs"
    }
  }
}
"""


def _extract_json_object(text: str) -> dict:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.strip("`")
        if cleaned.startswith("json"):
            cleaned = cleaned[4:].strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        start = cleaned.find("{")
        end = cleaned.rfind("}")
        if start == -1 or end == -1 or end <= start:
            raise ValueError(f"Model returned non-JSON content:\n{text}")
        return json.loads(cleaned[start:end + 1])


def _build_iteration_prompt(user_prompt: str, steps: list[dict]) -> str:
    return (
        f"{SYSTEM_PROMPT}\n\n"
        f"TOOL_CATALOG:\n{json.dumps(TOOL_SPECS, indent=2)}\n\n"
        f"USER_REQUEST:\n{user_prompt}\n\n"
        f"PREVIOUS_STEPS:\n{json.dumps(steps, default=str, indent=2)}\n\n"
        "Return only JSON."
    )


async def run_agent(prompt: str):
    steps: list[dict] = []

    for step_number in range(1, 7):
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=_build_iteration_prompt(prompt, steps)
        )

        text = response.text or ""
        print(f"\nAgent decision step {step_number}:\n", text)
        decision = _extract_json_object(text)

        decision_type = decision.get("type")
        if decision_type == "tool_call":
            tool_name = decision["tool_name"]
            args = decision.get("arguments", {})

            print("\nExecuting tool:", tool_name)
            tool_result = await execute_tool(tool_name, args)
            print("\nTool result:\n", tool_result)

            steps.append(
                {
                    "step": step_number,
                    "tool_name": tool_name,
                    "arguments": args,
                    "tool_result": tool_result,
                    "reason": decision.get("reason"),
                }
            )
            continue

        if decision_type == "final":
            return decision.get("result", decision)

        raise ValueError(f"Invalid agent decision type: {decision_type}")

    raise RuntimeError("Agent exceeded max planning steps without returning a final response.")


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
