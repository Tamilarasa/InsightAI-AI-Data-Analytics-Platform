import requests

BASE_URL = "http://127.0.0.1:8000"

USERNAME = "tamil"
PASSWORD = "9842655155"

# 1. LOGIN TO GET TOKEN
token_response = requests.post(
    f"{BASE_URL}/api/token/",
    json={
        "username": USERNAME,
        "password": PASSWORD
    }
)

tokens = token_response.json()
access_token = tokens["access"]

print("Access token received ✅")

# 2. UPLOAD FILE
headers = {
    "Authorization": f"Bearer {access_token}"
}

files = {
    "file": open("test.csv", "rb")
}

upload_response = requests.post(
    f"{BASE_URL}/api/accounts/uploads/",
    headers=headers,
    files=files
)

print("Upload Status:", upload_response.status_code)
print("Response:", upload_response.json())