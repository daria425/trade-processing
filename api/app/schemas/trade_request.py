from pydantic import BaseModel
from typing import Literal, Any
class TradeRequest(BaseModel):
    ticker: str
    quantity: int
    price: int  # Price can be float or int
    trade_type: Literal["buy", "sell"]  # "buy" or "sell"