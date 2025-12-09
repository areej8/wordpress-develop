import pytest
import requests

# --- Placeholder Constants ---
# NON_EXISTENT_BLOCK: Used to test the 404 route handling.
NON_EXISTENT_BLOCK = "nonexistent/test-block" 

# DYNAMIC_BLOCK: ***FIX: MUST BE A VALID, REGISTERED DYNAMIC BLOCK NAME.***
# Changed from the generic placeholder to a common core dynamic block.
DYNAMIC_BLOCK = "core/latest-posts" 
# -----------------------------


def test_render_dynamic_block_with_attributes(base_url, auth_header):
    """
    Renders a dynamic block.
    FIX 1: Added "context": "edit" (Previously fixed 400 Bad Request).
    FIX 2: DYNAMIC_BLOCK constant must be a registered dynamic block (resolves 404).
    """
    url = f"{base_url}/block-renderer/{DYNAMIC_BLOCK}"
    
    # Include a valid attribute set for the block (e.g., core/latest-posts attributes)
    data = {
        # Using example attributes for 'core/latest-posts'
        "attributes": {"postsToShow": 3, "displayPostContent": True}, 
        "context": "edit" 
    }
    
    response = requests.post(url, json=data, auth=auth_header)
    
    # Expected 200 for a successful render
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.json()}"
    # ... additional assertions for rendered content ...


def test_render_invalid_block_fails(base_url, auth_header):
    """
    Attempts to render an unregistered block, expecting 404.
    FIX: Added "context": "edit" to the POST payload to prevent 400 Bad Request.
    """
    url = f"{base_url}/block-renderer/{NON_EXISTENT_BLOCK}"
    
    # Send a minimal POST request, including the required 'context'
    data = {
        "attributes": {},
        "context": "edit"
    }
    
    response = requests.post(url, json=data, auth=auth_header)
    
    # The server should return 404 for an unregistered block.
    assert response.status_code == 404, f"Expected 404, got {response.status_code}: {response.json()}"
