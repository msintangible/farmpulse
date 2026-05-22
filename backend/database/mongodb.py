from pymongo import MongoClient
from pymongo.database import Database
from pymongo.server_api import ServerApi

from backend.core.settings import DB_NAME, MONGODB_URI


_client: MongoClient | None = None


def get_mongo_client() -> MongoClient:
    global _client

    if _client is None:
        if not MONGODB_URI:
            raise RuntimeError("MONGODB_URI is not set.")
        _client = MongoClient(MONGODB_URI, server_api=ServerApi("1"))

    return _client


def get_database() -> Database:
    """The project database (`farmpulse`) for direct admin/seed access.

    Per ADR-002 this direct path is for non-agent administrative work only
    (e.g. demo seeding); the agent reaches MongoDB through the MCP server.
    """
    return get_mongo_client()[DB_NAME]


def ping_mongodb() -> None:
    get_mongo_client().admin.command("ping")


