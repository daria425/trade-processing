from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.tables import Trader
from datetime import datetime, timezone

async def get_trader_by_id(trader_id: str, session: AsyncSession) -> Trader | None:
    result = await session.execute(select(Trader).where(Trader.id == trader_id))
    trader = result.scalar_one_or_none()
    if not trader:
        raise ValueError(f"Trader with ID {trader_id} not found")
    return trader

async def signup_trader(uid:str, email:str, name:str, session: AsyncSession) -> Trader:
    exisiting_trader=await session.execute(select(Trader).where(Trader.id == uid))
    existing_trader = exisiting_trader.scalar_one_or_none()
    if existing_trader:
        raise ValueError("Trader already exists") 
    now=datetime.now(timezone.utc)
    new_trader=Trader(
        id=uid,
        email=email,
        name=name,
        status="online",
        notification_tokens=[],
        created_at=now,
        updated_at=now,
        last_seen_at=now
    )
    session.add(new_trader)
    await session.commit()
    await session.refresh(new_trader)
    return new_trader

async def login_trader(uid:str, session: AsyncSession) -> Trader:
    existing_trader = await session.execute(select(Trader).where(Trader.id == uid))
    trader = existing_trader.scalar_one_or_none()
    if not trader:
        raise ValueError("Trader does not exist")
    return trader