"""
Configuration settings for WordPress REST API tests.
Uses Application Password authentication (WordPress native method).
"""
import os

# Base URLs
BASE_URL = os.environ.get('API_BASE_URL', 'http://localhost:8889/wp-json/wp/v2')
WP_BASE_URL = os.environ.get('WP_BASE_URL', 'http://localhost:8889')
API_ROOT = os.environ.get('API_ROOT', 'http://localhost:8889/wp-json/')

# Authentication credentials
USERNAME = os.environ.get('WP_USERNAME', 'aneeqawali')
PASSWORD = os.environ.get('WP_APP_PASSWORD', os.environ.get('WP_PASSWORD', '@pytest100'))

# Print configuration (helpful for debugging)
if os.environ.get('DEBUG'):
    print(f"[Config] BASE_URL: {BASE_URL}")
    print(f"[Config] WP_BASE_URL: {WP_BASE_URL}")
    print(f"[Config] USERNAME: {USERNAME}")
