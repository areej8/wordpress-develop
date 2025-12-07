# schemas.py

# A minimal-but-robust WordPress Post Schema for validation.
# You should expand this to cover every field in the response if necessary.
POST_SCHEMA = {
    "type": "object",
    "required": ["id", "date", "slug", "status", "title", "content", "link"],
    "properties": {
        "id": {"type": "integer"},
        "date": {"type": "string", "format": "date-time"},
        "slug": {"type": "string"},
        "status": {"type": "string", "enum": ["publish", "future", "draft", "pending", "private"]},
        # 'title' and 'content' are objects containing 'rendered' and 'raw'
        "title": {
            "type": "object",
            "required": ["rendered", "raw"],
            "properties": {
                "rendered": {"type": "string"},
                "raw": {"type": "string"}
            }
        },
        "content": {
            "type": "object",
            "required": ["rendered", "raw"],
            "properties": {
                "rendered": {"type": "string"},
                "raw": {"type": "string"}
            }
        },
        "link": {"type": "string", "format": "url"},
        "author": {"type": "integer"}
    },
    "additionalProperties": True # Allows other standard WP fields not listed above
}

# The standard error response format for the WP REST API
ERROR_SCHEMA = {
    "type": "object",
    "required": ["code", "message", "data"],
    "properties": {
        "code": {"type": "string"},
        "message": {"type": "string"},
        "data": {"type": "object"}
    }
}

# schemas.py (APPEND this to your existing content)

ABILITY_CATEGORY_SCHEMA = {
    "type": "object",
    "required": ["slug", "label", "description"],
    "properties": {
        "slug": {"type": "string"},
        "label": {"type": "string"},
        "description": {"type": "string"},
        "meta": {"type": "object"} 
    },
    "additionalProperties": True
}

ABILITY_SCHEMA = {
    "type": "object",
    "required": ["name", "label", "category", "annotations"],
    "properties": {
        "name": {"type": "string"},
        "label": {"type": "string"},
        "description": {"type": "string"},
        "category": {"type": "string"},
        "annotations": {
            "type": "object",
            "properties": {
                "readonly": {"type": ["boolean", "null"]},
                "destructive": {"type": ["boolean", "null"]},
                "idempotent": {"type": ["boolean", "null"]},
            },
            "additionalProperties": True
        },
        "show_in_rest": {"type": "boolean"},
        # Additional complex fields like input/output schemas might be present
    },
    "additionalProperties": True 
}
