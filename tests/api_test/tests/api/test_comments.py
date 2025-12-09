# tests/api/test_comments.py

import pytest
import requests

def test_get_comments(base_url, auth_header):
    response = requests.get(f"{base_url}/comments", auth=auth_header)
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_create_comment(base_url, auth_header):
    # Ensure at least one post exists
    posts = requests.get(f"{base_url}/posts", auth=auth_header).json()
    if not posts:
        pytest.skip("No posts available to comment")
    post_id = posts[0]["id"]

    data = {
        "post": post_id,
        "content": "This is a test comment from pytest"
    }
    response = requests.post(f"{base_url}/comments", json=data, auth=auth_header)
    assert response.status_code == 201
    json_data = response.json()
    assert "This is a test comment from pytest" in json_data["content"]["rendered"]  

def test_update_comment(base_url, auth_header):
    comments = requests.get(f"{base_url}/comments", auth=auth_header).json()
    if not comments:
        pytest.skip("No comments to update")
    comment_id = comments[0]["id"]
    data = {"content": "Updated comment via pytest"}
    response = requests.post(f"{base_url}/comments/{comment_id}", json=data, auth=auth_header)
    assert response.status_code in [200, 201]

def test_delete_comment(base_url, auth_header):
    comments = requests.get(f"{base_url}/comments", auth=auth_header).json()
    if not comments:
        pytest.skip("No comments to delete")
    comment_id = comments[0]["id"]
    response = requests.delete(f"{base_url}/comments/{comment_id}?force=true", auth=auth_header)
    assert response.status_code == 200

