import pytest
import requests
import time

# base_url and auth_header are assumed to be fixtures provided by your conftest.py

def test_get_tags(base_url):
    """Test retrieving a list of tags (Read)."""
    response = requests.get(f"{base_url}/tags")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_create_tag(base_url, auth_header):
    """Test creating a new tag (Create)."""
    # Use time for a unique name to prevent conflicts during repeated test runs
    unique_name = f"Pytest Tag {int(time.time())}"
    data = {
        "name": unique_name,
        "description": "A tag created by a pytest script"
    }
    response = requests.post(f"{base_url}/tags", json=data, auth=auth_header)
    assert response.status_code == 201
    json_data = response.json()
    assert json_data["name"] == unique_name
    
    # Cleanup: Delete the created tag immediately after the test
    requests.delete(f"{base_url}/tags/{json_data['id']}?force=true", auth=auth_header)

def test_update_tag(base_url, auth_header):
    """Test updating an existing tag (Update)."""
    # 1. Create a tag to ensure we have one to update
    create_data = {"name": "Tag to Update", "slug": "temp-update-tag"}
    create_response = requests.post(f"{base_url}/tags", json=create_data, auth=auth_header)
    if create_response.status_code != 201:
        pytest.skip("Could not create tag for update test.")
    tag_id = create_response.json()["id"]

    # 2. Now, update the tag
    update_data = {"name": "Tag Updated via Pytest"}
    response = requests.post(f"{base_url}/tags/{tag_id}", json=update_data, auth=auth_header)
    
    # 3. Check for success
    assert response.status_code in [200, 201]
    updated_json = response.json()
    assert updated_json["name"] == "Tag Updated via Pytest"

    # Cleanup
    requests.delete(f"{base_url}/tags/{tag_id}?force=true", auth=auth_header)

def test_delete_tag(base_url, auth_header):
    """Test deleting an existing tag (Delete)."""
    # 1. Create a tag to ensure we have one to delete
    create_data = {"name": "Tag to Delete", "slug": "temp-delete-tag"}
    create_response = requests.post(f"{base_url}/tags", json=create_data, auth=auth_header)
    if create_response.status_code != 201:
        pytest.skip("Could not create tag for deletion test.")
    tag_id = create_response.json()["id"]

    # 2. Now, delete the tag
    response = requests.delete(f"{base_url}/tags/{tag_id}?force=true", auth=auth_header)
    
    # Check for successful deletion (200 OK)
    assert response.status_code == 200
    
    # Optional: Verify it's truly gone (404 Not Found)
    verify_response = requests.get(f"{base_url}/tags/{tag_id}", auth=auth_header)
    assert verify_response.status_code == 404
