import os
from pathlib import Path
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.server_api import ServerApi

load_dotenv(Path(__file__).resolve().parents[1] / ".env")
uri = os.getenv("MONGODB_URI")
if not uri or "<db_password>" in uri:
    raise ValueError(
        "Set MONGODB_URI in backend/.env with your real Atlas password (not <db_password>)."
    )

client = MongoClient(uri, server_api=ServerApi('1'))

# Step 1: test connection
client.admin.command('ping')
print("Connected to MongoDB!")

# Step 2: create/select database
db = client["mcp_demo_db"]


# Step 3: create/select collection
users_collection = db["users"]

# Step 4: insert test data
result = users_collection.insert_one({
    "name": "John Doe",
    "email": "john@example.com",
    "role": "tester"
})

print("Inserted ID:", result.inserted_id)
