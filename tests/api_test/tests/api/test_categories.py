import pytest
import requests
import time

def test_get_categories(base_url):
    """Test retrieving a list of categories (Read)."""
    response = requests.get(f"{base_url}/categories")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_create_category(base_url, auth_header):
    """Test creating a new category (Create)."""
    # Use time for a unique name to avoid conflicts during repeated runs
    unique_name = f"Pytest Category {int(time.time())}"
    data = {
        "name": unique_name,
        "description": "A category created by a pytest script"
    }
    response = requests.post(f"{base_url}/categories", json=data, headers=auth_header)
    assert response.status_code == 201
    json_data = response.json()
    assert json_data["name"] == unique_name
    
    # Cleanup (important for taxonomy tests)
    requests.delete(f"{base_url}/categories/{json_data['id']}?force=true", headers=auth_header)


def test_update_category(base_url, auth_header):
    """Test updating an existing category (Update)."""
    # 1. Create a category to ensure we have one to update
    create_data = {"name": "Category to Update", "slug": "temp-update-cat"}
    create_response = requests.post(f"{base_url}/categories", json=create_data, headers=auth_header)
    if create_response.status_code != 201:
        pytest.skip("Could not create category for update test.")
    category_id = create_response.json()["id"]

    # 2. Now, update the category
    update_data = {"name": "Category Updated via Pytest"}
    response = requests.post(f"{base_url}/categories/{category_id}", json=update_data, headers=auth_header)
    
    # 3. Check for success
    assert response.status_code in [200, 201]
    updated_json = response.json()
    assert updated_json["name"] == "Category Updated via Pytest"

    # Cleanup
    requests.delete(f"{base_url}/categories/{category_id}?force=true", headers=auth_header)


def test_delete_category(base_url, auth_header):
    """Test deleting an existing category (Delete)."""
    # 1. Create a category to ensure we have one to delete
    create_data = {"name": "Category to Delete", "slug": "temp-delete-cat"}
    create_response = requests.post(f"{base_url}/categories", json=create_data, headers=auth_header)
    if create_response.status_code != 201:
        pytest.skip("Could not create category for deletion test.")
    category_id = create_response.json()["id"]

    # 2. Now, delete the category
    response = requests.delete(f"{base_url}/categories/{category_id}?force=true", headers=auth_header)
    
    assert response.status_code == 200
