import pytest
import requests

def test_get_pages(base_url):
    """Test retrieving a list of pages (Read)."""
    response = requests.get(f"{base_url}/pages")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_create_page(base_url, auth_header):
    """Test creating a new page (Create)."""
    data = {
        "title": "Pytest Page Title",
        "content": "This page was created by pytest for testing purposes.",
        "status": "publish"
    }
    response = requests.post(f"{base_url}/pages", json=data, auth=auth_header)
    assert response.status_code == 201
    json_data = response.json()
    assert json_data["title"]["rendered"] == "Pytest Page Title"
    assert json_data["status"] == "publish"

def test_update_page(base_url, auth_header):
    """Test updating an existing page (Update)."""
    # 1. Find a page to update or create one (good practice to create a test object)
    pages = requests.get(f"{base_url}/pages", auth=auth_header).json()
    if not pages:
        pytest.skip("No pages to update")
    page_id = pages[0]["id"]
    
    # 2. Send update request
    update_data = {"title": "Updated Pytest Page Title"}
    response = requests.post(f"{base_url}/pages/{page_id}", json=update_data, auth=auth_header)
    
    assert response.status_code in [200, 201]
    updated_json = response.json()
    assert updated_json["title"]["rendered"] == "Updated Pytest Page Title"

def test_delete_page(base_url, auth_header):
    """Test deleting an existing page (Delete)."""
    pages = requests.get(f"{base_url}/pages", auth=auth_header).json()
    if not pages:
        pytest.skip("No pages to delete")
    page_id = pages[0]["id"]
    
    response = requests.delete(f"{base_url}/pages/{page_id}?force=true", auth=auth_header)
    
    # Check for successful deletion
    assert response.status_code == 200
    
    # Optional: Verify it's truly gone
    verify_response = requests.get(f"{base_url}/pages/{page_id}", auth=auth_header)
    assert verify_response.status_code == 404
