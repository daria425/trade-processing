from sqlalchemy.ext.asyncio import AsyncSession
from app.models.tables import Notification
from datetime import datetime, timezone
async def create_notification(message:str, trader_id: str, session: AsyncSession):
    notification=Notification(trader_id=trader_id, message=message, read=False,created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc))
    session.add(notification)
    await session.commit()

