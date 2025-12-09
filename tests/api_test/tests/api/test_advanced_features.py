# test_advanced_features.py
import pytest
import requests
import time

# --- Test Cases ---

def test_unauthorized_post_creation(base_url):
    """Security: Verify non-authenticated users cannot create content."""
    data = {
        "title": "Unauthorized Post Attempt",
        "content": "Should fail",
        "status": "publish"
    }
    # Attempt to create a post without an Authorization header
    response = requests.post(f"{base_url}/posts", json=data)
    
    # Expecting 401 Unauthorized or 403 Forbidden
    assert response.status_code in [401, 403]


def test_invalid_data_post_creation(base_url, auth_header):
    """Error Handling: Verify the API handles missing required fields gracefully."""
    # Attempt to create a post with NO title (Title is conceptually required, 
    # but the API typically defaults it to empty).
    data = {
        "content": "Post with no title",
        "status": "publish"
    }
    response = requests.post(f"{base_url}/posts", json=data, auth=auth_header)
    
    # FIX: Change expected status code from 400 to 201
    assert response.status_code == 201 
    
    json_data = response.json()
    
    # FIX: Verify that the title was defaulted (empty string or "Auto Draft")
    # This confirms the API's actual, successful behavior for missing 'title'
    assert json_data["title"]["raw"] == "" or "no title" in json_data["title"]["rendered"].lower()
    
    # Cleanup: Delete the post that was successfully created
    requests.delete(f"{base_url}/posts/{json_data['id']}?force=true", auth=auth_header)


def test_post_status_filtering(base_url, auth_header):
    """Filtering: Test filtering by post status (e.g., drafts)."""
    # 1. Create a draft post
    data = {
        "title": f"Draft Post {int(time.time())}",
        "status": "draft"
    }
    create_response = requests.post(f"{base_url}/posts", json=data, auth=auth_header)
    draft_id = create_response.json()["id"]

    # 2. Query for drafts
    filter_response = requests.get(f"{base_url}/posts?status=draft", auth=auth_header)
    
    # 3. Verify the draft is in the filtered list
    draft_is_present = any(post["id"] == draft_id for post in filter_response.json())
    assert draft_is_present is True
    
    # Cleanup: Delete the draft
    requests.delete(f"{base_url}/posts/{draft_id}?force=true", auth=auth_header)


def test_get_post_with_embedding(base_url, auth_header):
    """Embedding: Test using the '_embed' parameter to fetch related data (e.g., author, featured media) in one request."""
    # Note: Requires a post with a featured image and/or an author other than 'admin' for a full test.
    
    # Fetch a single post
    response = requests.get(f"{base_url}/posts?per_page=1", auth=auth_header)
    if not response.json():
        pytest.skip("No posts available to test embedding.")
    
    post_id = response.json()[0]["id"]
    
    # Request the post with embedding enabled
    embed_response = requests.get(f"{base_url}/posts/{post_id}?_embed=true", auth=auth_header)
    
    assert embed_response.status_code == 200
    
    # Verify the '_embedded' object is present
    assert "_embedded" in embed_response.json()
    
    # Check for a common embedded resource, like the author (wp:author)
    assert "author" in embed_response.json()["_embedded"]
