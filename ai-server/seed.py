import requests
import json

BASE_URL = "http://localhost:8000"
API_KEY = "shangla_admin_2024"

print("🌱 Seeding Shangla knowledge base...")

response = requests.post(
    f"{BASE_URL}/ai/seed-knowledge",
    params={"api_key": API_KEY}
)

if response.status_code == 200:
    data = response.json()
    print(f"✅ {data['message']}")
    print(f"📚 Chunks created: {data['chunks_created']}")
else:
    print(f"❌ Error: {response.text}")