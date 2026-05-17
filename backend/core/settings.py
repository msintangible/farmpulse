import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BASE_DIR / ".env")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
MONGODB_URI = os.getenv("MONGODB_URI")

# Logical MongoDB database name — fixed for the project (PROJECT_PLAN Day 1).
# A constant, not an env var: it is the same in every environment, unlike
# MONGODB_URI which is a per-deployment secret.
DB_NAME = "farmpulse"
