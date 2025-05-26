from pydantic import BaseModel

class TradeRequest(BaseModel):
    ticker: str
    quantity: int
