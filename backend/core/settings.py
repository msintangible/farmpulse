import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BASE_DIR / ".env")

MONGODB_URI = os.getenv("MONGODB_URI")

# Logical MongoDB database name — fixed for the project (PROJECT_PLAN Day 1).
# A constant, not an env var: it is the same in every environment, unlike
# MONGODB_URI which is a per-deployment secret.
DB_NAME = "farmpulse"

# --- Vertex AI (ADR-001) ---
# Auth is via Application Default Credentials (gcloud auth application-default
# login locally; a service account with roles/aiplatform.user on Cloud Run),
# so there is deliberately no AI API key in config. These locate the project.
GOOGLE_CLOUD_PROJECT = os.getenv("GOOGLE_CLOUD_PROJECT")
GOOGLE_CLOUD_LOCATION = os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1")
