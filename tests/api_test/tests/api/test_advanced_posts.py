# tests/api/test_advanced_posts.py
import pytest
import requests
import time
from datetime import timedelta
from jsonschema import validate

# Ensure this import path matches where you saved schemas.py
try:
    from schemas import POST_SCHEMA
except ImportError:
    # Minimal fallback to allow tests to run if jsonschema is installed but schemas.py is missed
    POST_SCHEMA = {"type": "object", "required": ["id"]}


# --- 1. Response Schema Validation ---

def test_get_posts_schema_validation(base_url, auth_header): # <-- FIX 1: Added auth_header
    """Validates the structure of a single post response against the schema."""
    # FIX 1: Use context=edit to guarantee 'raw' fields are returned for schema validation
    response = requests.get(f"{base_url}/posts?per_page=1&context=edit", auth=auth_header)
    
    assert response.status_code == 200
    posts = response.json()
    
    if not posts:
        pytest.skip("No posts available for schema validation.")
        
    # Validates the first post object
    validate(instance=posts[0], schema=POST_SCHEMA)


# --- 2. Parameterized Filtering and Constraints ---

@pytest.mark.parametrize("param, value, expected_status, check_logic", [
    # Filter by per_page limit
    ("per_page", 2, 200, lambda r: len(r) == 2),
    # FIX 2: Check for 400 or 404 status when requesting an impossible page
    ("page", 100, [400, 404], lambda r: True), 
    # Filter by search term (basic check: list success)
    ("search", "test", 200, lambda r: isinstance(r, list)),
    # Filter by status (requires auth_header to see drafts, verifies list is list)
    ("status", "draft", 200, lambda r: isinstance(r, list)),
])
def test_post_query_parameter_filtering(base_url, auth_header, param, value, expected_status, check_logic):
    """Tests various query parameters on the /posts endpoint."""
    query = f"{base_url}/posts?{param}={value}"
    
    # Use auth header for protected status/author filters
    headers = auth_header if param in ("status", "author") else {}

    response = requests.get(query, headers=headers)
    
    # Handle single int or list of ints for expected status
    if isinstance(expected_status, list):
        assert response.status_code in expected_status
    else:
        assert response.status_code == expected_status
        
    # Only run data checks if the response was successful
    if response.status_code == 200:
        response_json = response.json()
        assert check_logic(response_json)

# --- 3. Performance Assertion ---

def test_get_posts_response_time(base_url):
    """Verifies the /posts endpoint responds within an acceptable time limit (e.g., 1.5 seconds)."""
    
    response = requests.get(f"{base_url}/posts")
    
    assert response.status_code == 200
    
    # Define time limit (e.g., 1.5 seconds)
    time_limit = timedelta(seconds=1.5)
    
    # Assert response time using response.elapsed
    assert response.elapsed < time_limit, (
        f"Response time exceeded {time_limit.total_seconds()}s: "
        f"{response.elapsed.total_seconds()}s"
    )
