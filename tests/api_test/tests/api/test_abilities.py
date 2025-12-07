# tests/api/test_abilities.py
import pytest
import requests

# try to import optional JSON schemas; if unavailable, skip schema assertions
try:
    from jsonschema import validate
    from schemas import ABILITY_SCHEMA, ABILITY_CATEGORY_SCHEMA, ERROR_SCHEMA
    HAVE_SCHEMAS = True
except Exception:
    HAVE_SCHEMAS = False

def abilities_root(base_url: str) -> str:
    """
    FIXED: Returns the full base URL for the Abilities API by correctly replacing 
    the core /wp/v2 namespace with the custom /wp-abilities/v1 namespace.
    
    This function now avoids duplicating the '/wp-json/' segment.
    """
    # This line fixes the URL construction error (the single line issue)
    return base_url.replace("/wp/v2", "/wp-abilities/v1")


# --- The list and category retrieval tests have been removed as requested. ---


def test_run_ability_requires_authentication(base_url):
    """
    Attempts to execute an ability without authentication and expects failure.
    URL hit: http://localhost:8000/wp-json/wp-abilities/v1/any-ability-name/run
    """
    # The URL structure is assumed to be: {root}/{ability-name}/run
    run_url = f"{abilities_root(base_url)}/any-ability-name/run"
    r = requests.post(run_url, json={})
    
    # If the route exists, it should require auth (401/403). If the route/ability is missing, it's 404.
    assert r.status_code in (401, 403, 404), f"unexpected status {r.status_code}: {r.text}"
    if HAVE_SCHEMAS and r.status_code != 404:
        # only validate error schema for auth/forbidden responses
        validate(instance=r.json(), schema=ERROR_SCHEMA)

def test_run_non_existent_ability(base_url, auth_header):
    """
    Attempts to execute an ability that doesn't exist while authenticated.
    URL hit: http://localhost:8000/wp-json/wp-abilities/v1/does-not-exist/run
    """
    # The URL structure is assumed to be: {root}/{ability-name}/run
    run_url = f"{abilities_root(base_url)}/does-not-exist/run"
    r = requests.post(run_url, headers=auth_header, json={})
    
    # When authenticated, running a non-existent ability should return 404
    assert r.status_code == 404, f"expected 404, got {r.status_code}: {r.text}"
    if HAVE_SCHEMAS:
        validate(instance=r.json(), schema=ERROR_SCHEMA)
