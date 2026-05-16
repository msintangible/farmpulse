import asyncio
import os
import sys
from pathlib import Path
from contextlib import AsyncExitStack
from datetime import timedelta

import anyio
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from backend.core.settings import MONGODB_URI


class MongoMCPClient:
    def __init__(self, read_timeout_seconds=30):
        self.session = None
        self._exit_stack = None
        self.read_timeout_seconds = read_timeout_seconds

    async def connect(self):
        if self.session is not None:
            return

        process_env = dict(os.environ)
        mongo_uri = (
            process_env.get("MONGODB_URI")
            or process_env.get("MDB_MCP_CONNECTION_STRING")
            or MONGODB_URI
        )
        if mongo_uri:
            process_env["MDB_MCP_CONNECTION_STRING"] = mongo_uri

        server_params = StdioServerParameters(
            command="npx",
            args=["-y", "--yes", "mongodb-mcp-server@latest"],
            env=process_env
        )

        self._exit_stack = AsyncExitStack()
        read_stream, write_stream = await self._exit_stack.enter_async_context(stdio_client(server_params))
        self.session = await self._exit_stack.enter_async_context(
            ClientSession(
                read_stream,
                write_stream,
                read_timeout_seconds=timedelta(seconds=self.read_timeout_seconds)
            )
        )
        await self.session.initialize()

    async def call_tool(self, tool_name, arguments, timeout_seconds=30):
        if not self.session:
            await self.connect()

        try:
            with anyio.fail_after(timeout_seconds):
                return await self.session.call_tool(tool_name, arguments)
        except TimeoutError as exc:
            raise TimeoutError(f"MCP tool '{tool_name}' timed out after {timeout_seconds}s.") from exc

    @staticmethod
    def extract_error_text(result):
        if not getattr(result, "isError", False):
            return None

        parts = []
        for item in getattr(result, "content", []) or []:
            text = getattr(item, "text", None)
            if text:
                parts.append(text)
        return "\n".join(parts) if parts else "Unknown MCP tool error"

    async def list_tools(self, timeout_seconds=30):
        if not self.session:
            await self.connect()

        with anyio.fail_after(timeout_seconds):
            result = await self.session.list_tools()
        return [tool.name for tool in result.tools]

    async def close(self):
        if self._exit_stack is None:
            return

        try:
            with anyio.move_on_after(3):
                await self._exit_stack.aclose()
        finally:
            self._exit_stack = None
            self.session = None




mcp_client: MongoMCPClient = MongoMCPClient()

async def test():
    client = MongoMCPClient()
    try:
        print("Connecting to MCP...")
        await client.connect()

        print("Connected!")

        print("Discovering server tools...")
        tools = await client.list_tools()
        print("Available tools:", tools)


        print("Testing tool call...")
        if not (os.getenv("MONGODB_URI") or os.getenv("MDB_MCP_CONNECTION_STRING")):
            raise RuntimeError("Set MONGODB_URI (or MDB_MCP_CONNECTION_STRING) before running this test.")

        print("Checking MongoDB connection...")
        db_check = await client.call_tool("list-databases", {})
        db_check_error = client.extract_error_text(db_check)
        if db_check_error:
            raise RuntimeError(
                "MongoDB MCP is not connected. Set a valid connection string in "
                "MDB_MCP_CONNECTION_STRING or MONGODB_URI.\n"
                f"Server response:\n{db_check_error}"
            )
        print("MongoDB connection check passed")

        print("Calling MCP tool: insert-many")
        result = await client.call_tool(
            "insert-many",
            {
                "database": "test",
                "collection": "users",
                "documents": [
                    {
                        "name": "John Doe",
                        "email": "john@test.com"
                    }
                ]
            }
        )
        insert_error = client.extract_error_text(result)
        if insert_error:
            raise RuntimeError(f"MCP insert-many tool failed:\n{insert_error}")
        print("MCP tool insert-many completed")

        print("RESULT:")
        print(result)
    finally:
        await client.close()


if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(test())
