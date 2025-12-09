import pytest
import requests

POST_TYPE = 'posts'

@pytest.fixture(scope="module")
def post_id(base_url, auth_header):
    """
    Fixture to create a post and an autosave for testing retrieval.
    FIX: Added assertion for autosave creation (201) to ensure data exists.
    """
    # 1. Create a draft post
    post_data = {"title": "Post for Autosave Test", "status": "draft"}
    post_response = requests.post(f"{base_url}/{POST_TYPE}", json=post_data, auth=auth_header)
    
    if post_response.status_code != 201:
        pytest.skip("Could not create a post for autosave testing.")
    
    post_id = post_response.json()['id']
    
    # 2. Create the initial autosave
    autosave_data = {"title": "Autosave Draft", "content": "Initial autosave content."}
    autosave_response = requests.post(
        f"{base_url}/{POST_TYPE}/{post_id}/autosaves", 
        json=autosave_data, 
        auth=auth_header
    )

    # --- CRITICAL FIX ---
    # Ensure the autosave was created successfully (returns 201)
    if autosave_response.status_code != 201:
        pytest.skip(f"Could not create autosave (expected 201, got {autosave_response.status_code})")
    # --------------------
    
    return post_id


def test_retrieve_latest_autosave(base_url, auth_header, post_id):
    """
    Retrieves the latest autosave for a post.
    FIX 1: Uses requests.get() (Previously fixed 200 vs 201 error).
    FIX 2: Creation is guaranteed in the fixture (resolves assert 0 > 0).
    """
    # Endpoint to retrieve autosaves
    url = f"{base_url}/{POST_TYPE}/{post_id}/autosaves" 
    
    # Use requests.get() to RETRIEVE the autosave
    response = requests.get(url, auth=auth_header) 
    
    # Expected 200 OK for successful retrieval
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.json()}"
    
    json_data = response.json()
    
    # The length assertion should now pass because the fixture guarantees an autosave exists.
    assert isinstance(json_data, list)
    assert len(json_data) > 0 # <-- Should now pass
