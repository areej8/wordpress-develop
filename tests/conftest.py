# tests/conftest.py
import sys
import os

# Get the directory of the current file (conftest.py) -> .../project/tests
current_dir = os.path.dirname(__file__)

# Go up one level (..) to the project root -> .../project
PROJECT_ROOT = os.path.abspath(os.path.join(current_dir, '..'))

# Insert the project root into sys.path
# This allows Python to find 'config' as a top-level package.
sys.path.insert(0, PROJECT_ROOT)
import pytest
import requests
from config.settings import BASE_URL, AUTH_URL, USERNAME, PASSWORD

@pytest.fixture(scope="session")
def base_url():
    return BASE_URL

@pytest.fixture(scope="session")
def auth_token():
    payload = {"username": USERNAME, "password": PASSWORD}
    response = requests.post(AUTH_URL, json=payload)
    assert response.status_code == 200, f"Auth failed: {response.text}"
    token = response.json()["token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture(scope="session")
def auth_header(auth_token):
    return auth_token

