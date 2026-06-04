import requests

BASE_URL = "http://127.0.0.1:8000"

# 1. STEP: LOGIN AND GET TOKEN AUTOMATICALLY
login_url = f"{BASE_URL}/api/token/"

login_data = {
    "username": "tamil",
    "password": "9842655155"
}

token_res = requests.post(login_url, data=login_data)

print("Login Response:", token_res.json())

access_token = token_res.json().get("access")

if not access_token:
    print("❌ Login failed, no token received")
    exit()

# 2. STEP: CALL INSIGHTS API
headers = {
    "Authorization": f"Bearer {access_token}"
}

url = f"{BASE_URL}/api/accounts/insights/1/"

response = requests.get(url, headers=headers)

print("\nStatus:", response.status_code)
print("Response:", response.json())