import os
from pathlib import Path
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.server_api import ServerApi

load_dotenv(Path(__file__).resolve().parents[1] / ".env")
uri = os.getenv("MONGODB_URI")


client = MongoClient(uri, server_api=ServerApi('1'))

# Step 1: test connection
client.admin.command('ping')
print("Connected to MongoDB!")


