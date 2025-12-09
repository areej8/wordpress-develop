import sys
import os

current_dir = os.path.dirname(__file__)
PROJECT_ROOT = os.path.abspath(os.path.join(current_dir, '..'))
sys.path.insert(0, PROJECT_ROOT)

import pytest
import requests
from requests.auth import HTTPBasicAuth
from config.settings import BASE_URL, WP_BASE_URL, API_ROOT, USERNAME, PASSWORD


@pytest.fixture(scope="session")
def base_url():
    return BASE_URL


@pytest.fixture(scope="session")
def api_base_url():
    return BASE_URL


@pytest.fixture(scope="session")
def wp_base_url():
    return WP_BASE_URL


@pytest.fixture(scope="session")
def api_root():
    return API_ROOT


@pytest.fixture(scope="session")
def auth_credentials():
    return HTTPBasicAuth(USERNAME, PASSWORD)


@pytest.fixture(scope="session")
def auth_token(auth_credentials):
    # Returns auth credentials for backward compatibility
    return auth_credentials


@pytest.fixture(scope="session")
def auth_header(auth_credentials):
    return auth_credentials


@pytest.fixture(scope="session")
def authenticated_session(auth_credentials):
    session = requests.Session()
    session.auth = auth_credentials
    session.headers.update({
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    })
    return session


@pytest.fixture
def api_headers():
    return {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
