from pymongo import MongoClient
from pymongo.server_api import ServerApi

from backend.core.settings import MONGODB_URI


_client: MongoClient | None = None


def get_mongo_client() -> MongoClient:
    global _client

    if _client is None:
        if not MONGODB_URI:
            raise RuntimeError("MONGODB_URI is not set.")
        _client = MongoClient(MONGODB_URI, server_api=ServerApi("1"))

    return _client


def ping_mongodb() -> None:
    get_mongo_client().admin.command("ping")


