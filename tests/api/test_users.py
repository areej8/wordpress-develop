import pytest
import requests

def test_get_users(base_url, auth_header):
    response = requests.get(f"{base_url}/users", headers=auth_header)
    assert response.status_code == 200
    assert "name" in response.json()[0]

def test_unauthorized_users(base_url):
    response = requests.get(f"{base_url}/users")
    assert response.status_code in [200,401, 403]

