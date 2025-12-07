
import requests
from config.settings import AUTH_URL, USERNAME, PASSWORD

def test_login():
    payload = {"username": USERNAME, "password": PASSWORD}
    response = requests.post(AUTH_URL, json=payload)
    assert response.status_code == 200
    assert "token" in response.json()

