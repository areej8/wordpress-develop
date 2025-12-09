# test_media.py
import pytest
import requests
import io
import time
# --- Helper Functions (Fixtures assumed to be in conftest.py) ---

def create_dummy_file():
    """Creates an in-memory JPEG file for upload."""
    
    # Simple checkboard pattern data (minimal valid JPEG header + data)
    # This is not a full JPEG, but is often enough to pass basic server checks
    # For robust testing, use a real, minimal byte array for a valid JPEG/PNG
    dummy_image_data = b'\xff\xd8\xff\xe0\x00\x10\x4a\x46\x49\x46\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00\xff\xdb\x00\x43\x00\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\xff\xc0\x00\x0b\x08\x00\x01\x00\x01\x01\x01\x11\x00\xff\xc4\x00\x14\x10\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xff\xda\x00\x08\x01\x01\x00\x00\x3f\x00\xd2\xff\xd9'
    
    return io.BytesIO(dummy_image_data)

# --- Test Cases ---

@pytest.fixture(scope="module")
def uploaded_media_id(base_url, auth_header):
    """Fixture to upload a file before tests and yield its ID, ensuring cleanup."""
    file_name = f"pytest_upload_{int(time.time())}.jpg"
    files = {'file': (file_name, create_dummy_file(), 'image/jpeg')}
    
    # Note the 'Content-Disposition' header is REQUIRED for WordPress media uploads
    headers = auth_header.copy()
    headers['Content-Disposition'] = f'attachment; filename={file_name}'

    response = requests.post(f"{base_url}/media", files=files, headers=headers)
    
    if response.status_code != 201:
        pytest.fail(f"Failed to upload media: {response.text}")

    media_id = response.json()["id"]
    yield media_id
    
    # Cleanup: Delete the media item after all tests are done
    requests.delete(f"{base_url}/media/{media_id}?force=true", auth=auth_header)


def test_get_media_items(base_url):
    """Test retrieving a list of media items (Read)."""
    response = requests.get(f"{base_url}/media")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_update_media_item(base_url, auth_header, uploaded_media_id):
    """Test updating the title/caption of an existing media item (Update)."""
    media_id = uploaded_media_id
    new_title = "Updated Pytest Media Title"
    
    data = {"title": new_title}
    response = requests.post(f"{base_url}/media/{media_id}", json=data, auth=auth_header)
    
    assert response.status_code in [200, 201]
    updated_json = response.json()
    assert updated_json["title"]["raw"] == new_title
