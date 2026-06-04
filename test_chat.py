import requests

# 1. LOGIN FIRST
login = requests.post(
    "http://127.0.0.1:8000/api/token/",
    data={"username": "tamil", "password": "9842655155"}
)

token = login.json()["access"]

headers = {
    "Authorization": f"Bearer {token}"
}

# 2. CHAT WITH DATASET
url = "http://127.0.0.1:8000/api/accounts/chat/1/"

data = {
    "question": "Give me a summary of this dataset"
}

res = requests.post(url, json=data, headers=headers)

print(res.json())