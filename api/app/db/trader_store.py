from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.tables import Trader
import math
from datetime import datetime, timezone
from app.utils.logger import logger
import yfinance as yf
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
    return {
        "trader": new_trader,
        "holdings": [],
        "portfolio_value": 0.0,
    }

async def login_trader(uid:str, session: AsyncSession) -> Trader:
    existing_trader = await session.execute(select(Trader).where(Trader.id == uid))
    trader = existing_trader.scalar_one_or_none()
    if not trader:
        raise ValueError("Trader does not exist")

    await session.refresh(trader, ["holdings"])

    portfolio_value = 0.0
    holdings_list=[]
    for holding in trader.holdings:
        try:
            price_data = yf.download([holding.symbol], period="1d", interval="1m", progress=False)
            if price_data.empty:
                logger.warning(f"No price data found for {holding.symbol}")
                continue
            latest_price = price_data["Close"].iloc[-1]
            if not math.isnan(latest_price):
                current_price = float(latest_price)
            else:
                current_price = 0.0
            portfolio_value += holding.quantity * current_price
            holding_dict = {
                "id": str(holding.id),  # Convert UUID to string
                "symbol": holding.symbol,
                "quantity": holding.quantity,
                "price": holding.price,
                "purchase_date": holding.purchase_date.isoformat() if holding.purchase_date else None,
                "current_price": current_price,
                "current_value": holding.quantity * current_price,
            }
            holdings_list.append(holding_dict)
        except Exception as e:
            logger.error(f"Error fetching price for {holding.symbol}: {e}")
            continue
    print(holdings_list, portfolio_value)
    return {
        "trader": trader,
        "holdings": holdings_list,
        "portfolio_value": portfolio_value,
    }

async def update_notification_token(uid:str, token:str, session: AsyncSession) -> None:
    trader = await get_trader_by_id(uid, session)
    if not trader.notification_tokens:
        trader.notification_tokens = []
    if token not in trader.notification_tokens:
        trader.notification_tokens.append(token)
    now= datetime.now(timezone.utc)
    trader.status = "online"
    trader.updated_at = now
    trader.last_seen_at = now
    trader.is_messaging_enabled = True
    session.add(trader)
    await session.commit()
    logger.info(f"Notification token updated for trader {uid}")
