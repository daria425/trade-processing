import asyncio
from datetime import datetime, timezone
from app.db.database_connection import AsyncSessionLocal
from app.models.tables import Trader 

async def seed_trader():
    async with AsyncSessionLocal() as session:
        trader = Trader(
            id="trader_001",
            name="Test Trader",
            email="trader001@example.com",
            status="online",
            notification_tokens=["mock_token_001"],
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
            last_seen_at=datetime.now(timezone.utc)
        )
        session.add(trader)
        await session.commit()

if __name__ == "__main__":
    asyncio.run(seed_trader())
