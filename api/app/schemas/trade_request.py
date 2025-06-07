from pydantic import BaseModel, field_validator
from typing import Literal, Any
class TradeRequest(BaseModel):
    ticker: str
    quantity: int
    price: float  # Price can be float or int
    trade_type: Literal["buy", "sell"]  # "buy" or "sell"
   
    @field_validator('price')
    def ensure_price_number(cls, v):
        """Ensure price is converted to float regardless of input format."""
        if isinstance(v, str):
            return float(v)
        return float(v)