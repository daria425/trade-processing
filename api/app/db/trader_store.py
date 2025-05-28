from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.tables import Trader

async def get_trader_by_id(trader_id: str, session: AsyncSession) -> Trader | None:
    result = await session.execute(select(Trader).where(Trader.id == trader_id))
    return result.scalar_one_or_none()
