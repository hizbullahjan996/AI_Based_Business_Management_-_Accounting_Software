import os
from fastapi import HTTPException, Security
from fastapi.security.api_key import APIKeyHeader

API_KEY_NAME = "X-API-KEY"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)


def verify_api_key(api_key: str = Security(api_key_header)):
    """Verify API key provided in `X-API-KEY` header against env var `AI_API_KEY`.

    This is a lightweight protection for internal API usage. In production,
    integrate with proper auth (JWT, OAuth) and mTLS.
    """
    expected = os.getenv('AI_API_KEY')
    # If no API key is configured, allow requests (useful for local dev)
    if not expected:
        return True

    if not api_key or api_key != expected:
        raise HTTPException(status_code=401, detail="Invalid or missing API key")

    return True
