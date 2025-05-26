from fastapi import Header, HTTPException
FAKE_DB={
    "api-key-123": "trader_001",
    "api-key-456": "trader_002",
}

async def authenticate(api_key:str=Header(...)):
    if not api_key:
        raise HTTPException(401, "API Key must be provided")
    if api_key and api_key not in FAKE_DB:
        raise HTTPException(403, "Invalid API Key")
    return FAKE_DB[api_key]