from sqlalchemy.ext.asyncio import AsyncSession
from app.models.tables import Notification

async def create_notification(message:str, trader_id: str, session: AsyncSession):
    notification=Notification(trader_id=trader_id, message=message, read=False)
    session.add(notification)
    await session.commit()
