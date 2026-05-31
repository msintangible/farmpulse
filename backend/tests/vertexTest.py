from google import genai
from google.genai.types import HttpOptions

client = genai.Client(
    vertexai=True,
    project="farmpulse-496900",
    location="us-central1",
    http_options=HttpOptions(api_version="v1"),
)

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Say exactly: Hello from FarmPulse."
)

print(response.text)