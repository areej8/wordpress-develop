# tests/api/test_security.py
import pytest
import requests
import time
from jsonschema import validate

# Ensure this import path matches where you saved schemas.py
try:
    from schemas import ERROR_SCHEMA
except ImportError:
    # Minimal fallback
    ERROR_SCHEMA = {"type": "object", "required": ["code", "message"]}


# --- 1. Input Data Validation and Error Handling (Edge Cases) ---

def test_invalid_id_retrieval(base_url):
    """Test retrieving a post using a non-integer or invalid ID (Data Type Validation)."""
    # Attempt to retrieve a post using a string slug instead of an ID
    response = requests.get(f"{base_url}/posts/not-an-id")
    
    # Expecting 404 Not Found or 400 Bad Request
    assert response.status_code in [400, 404]
    
    # Validate the error response structure if 400 is returned
    if response.status_code == 400:
        validate(instance=response.json(), schema=ERROR_SCHEMA)


def test_invalid_data_type_on_update(base_url, auth_header):
    """Test updating a post, setting a field that expects an integer (like author) to a string."""
    
    # 1. Create a temporary post
    temp_title = f"Data Type Test {int(time.time())}"
    data = {"title": temp_title, "status": "draft"}
    create_response = requests.post(f"{base_url}/posts", json=data, headers=auth_header)
    post_id = create_response.json()["id"]
    
    # 2. Attempt to update the post with an invalid author ID type
    invalid_data = {"author": "invalid-user-name"} 
    response = requests.post(f"{base_url}/posts/{post_id}", json=invalid_data, headers=auth_header)
    
    # Expecting 400 Bad Request
    assert response.status_code == 400
    validate(instance=response.json(), schema=ERROR_SCHEMA)
    
    # Cleanup: Delete the post
    requests.delete(f"{base_url}/posts/{post_id}?force=true", headers=auth_header)


def test_nonexistent_entity_deletion(base_url, auth_header):
    """Test deleting an entity that does not exist (Error Handling)."""
    non_existent_id = 99999999
    
    response = requests.delete(f"{base_url}/posts/{non_existent_id}?force=true", headers=auth_header)
    
    # Expecting 404 Not Found
    assert response.status_code == 404
    validate(instance=response.json(), schema=ERROR_SCHEMA)


# --- 2. Role-Based Access Control (RBAC) Structure ---

# IMPORTANT: You must have fixtures defined in your conftest.py (or similar) 
# to get the authentication headers for different user roles (e.g., Contributor, Editor).

@pytest.mark.parametrize("role_fixture_name, expected_status", [
    ("editor_auth_header", 201),       # Editor can create and publish
    ("contributor_auth_header", 403),  # Contributor cannot 'publish' directly
])
def test_create_published_post_by_role(base_url, request, role_fixture_name, expected_status):
    """Verifies that only users with sufficient privileges can directly publish content."""
    
    # Dynamically retrieve the auth header fixture based on the parameter
    try:
        # request.getfixturevalue fetches the fixture defined in conftest.py
        auth_header = request.getfixturevalue(role_fixture_name)
    except pytest.FixtureLookupError:
        pytest.skip(f"Required fixture '{role_fixture_name}' not found. Cannot run role-based test.")
        
    post_data = {
        "title": f"Role Test {role_fixture_name} {int(time.time())}",
        "status": "publish"
    }
    
    response = requests.post(f"{base_url}/posts", json=post_data, headers=auth_header)
    
    assert response.status_code == expected_status
    
    # Conditional Cleanup (only clean up if the post was successfully created)
    if response.status_code == 201:
        post_id = response.json()["id"]
        requests.delete(f"{base_url}/posts/{post_id}?force=true", headers=auth_header)


def test_contributor_can_create_pending_post(base_url, request):
    """A contributor should be able to create a post, and its status should be 'pending' or 'draft'."""
    try:
        auth_header = request.getfixturevalue("contributor_auth_header")
    except pytest.FixtureLookupError:
        pytest.skip(f"Required fixture 'contributor_auth_header' not found. Cannot run role-based test.")

    post_data = {
        "title": f"Contributor Pending Post {int(time.time())}",
        "status": "draft"
    }
    
    response = requests.post(f"{base_url}/posts", json=post_data, headers=auth_header)
    
    # Expecting successful creation (201)
    assert response.status_code == 201
    
    # Verify the final status is a non-published state
    final_status = response.json()["status"]
    assert final_status in ["draft", "pending"]
    
    # Cleanup
    post_id = response.json()["id"]
    requests.delete(f"{base_url}/posts/{post_id}?force=true", headers=auth_header)
