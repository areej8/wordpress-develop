
import pytest
import requests

def test_get_posts(base_url):
    response = requests.get(f"{base_url}/posts")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_create_post(base_url, auth_header):
    data = {
        "title": "Pytest Post",
        "content": "This post was created by pytest.",
        "status": "publish"
    }
    response = requests.post(f"{base_url}/posts", json=data, auth=auth_header)
    assert response.status_code == 201
    json_data = response.json()
    assert json_data["title"]["rendered"] == "Pytest Post"

def test_update_post(base_url, auth_header):
    posts = requests.get(f"{base_url}/posts", auth=auth_header).json()
    if not posts:
        pytest.skip("No posts to update")
    post_id = posts[0]["id"]
    data = {"title": "Updated Pytest Post"}
    response = requests.post(f"{base_url}/posts/{post_id}", json=data, auth=auth_header)
    assert response.status_code in [200, 201]

def test_delete_post(base_url, auth_header):
    posts = requests.get(f"{base_url}/posts", auth=auth_header).json()
    if not posts:
        pytest.skip("No posts to delete")
    post_id = posts[0]["id"]
    response = requests.delete(f"{base_url}/posts/{post_id}?force=true", auth=auth_header)
    assert response.status_code == 200

