# tests/api/test_attachments.py
import pytest
import requests
import os

# NOTE: Actual file upload requires creating a dummy file and using multipart/form-data.
# The `file_name` parameter must be handled carefully.

def test_list_attachments(base_url, auth_header):
    """Test listing attachments (media) library content."""
    response = requests.get(f"{base_url}/media", headers=auth_header)
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_upload_attachment_metadata(base_url, auth_header):
    """
    Test a successful attachment upload. Requires setting the correct headers.
    This test assumes a simple dummy file is available in the test environment.
    """
    # Create a dummy file for the test
    dummy_filename = "dummy_image.txt"
    try:
        with open(dummy_filename, 'w') as f:
            f.write("This is dummy content.")

        # Simulate the file upload request
        with open(dummy_filename, 'rb') as f:
            # The 'Content-Disposition' header is crucial for WP to name the file
            headers = {
                "Authorization": auth_header["Authorization"],
                "Content-Disposition": f"attachment; filename={dummy_filename}",
                "Content-Type": "text/plain" 
            }
            
            response = requests.post(
                f"{base_url}/media", 
                data=f.read(),
                headers=headers
            )
            
        assert response.status_code == 201
        media_id = response.json()["id"]
        
        # Cleanup the uploaded file
        requests.delete(f"{base_url}/media/{media_id}", params={"force": True}, headers=auth_header)
        
    finally:
        # Cleanup the local dummy file
        if os.path.exists(dummy_filename):
            os.remove(dummy_filename)

def test_unauthorized_upload_fails(base_url):
    """Test that file upload fails without authentication."""
    response = requests.post(f"{base_url}/media")
    assert response.status_code in [401, 403]
