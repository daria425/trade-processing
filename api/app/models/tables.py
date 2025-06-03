from app.db.database_connection import Base
from sqlalchemy.orm import relationship
from sqlalchemy import Column, String, ForeignKey, Boolean, DateTime, func, Float, UUID
from datetime import datetime, timezone
from uuid import uuid4
import uuid
from sqlalchemy.dialects.postgresql import ARRAY
class Trader(Base):
    __tablename__ = "traders"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=True)
    status = Column(String, default="online")
    email = Column(String, nullable=True)
    notification_tokens=Column(ARRAY(String), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False)
    updated_at=Column(DateTime(timezone=True), nullable=True)
    last_seen_at=Column(DateTime(timezone=True), nullable=True)
    is_messaging_enabled = Column(Boolean, default=False, nullable=False)
    cash_balance: float = Column(Float, default=100000.0)
    holdings = relationship("Holding", back_populates="trader", cascade="all, delete-orphan")



    notifications = relationship("Notification", back_populates="trader")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, index=True, default=lambda:str(uuid.uuid4()))
    message = Column(String)
    read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), nullable=False)
    updated_at=Column(DateTime(timezone=True), nullable=True)
    trader_id = Column(String, ForeignKey("traders.id"))
    trader = relationship("Trader", back_populates="notifications")
    

class Holding(Base):
    __tablename__ = "holdings"
    id = Column(UUID, primary_key=True, default=uuid4)
    trader_id = Column(ForeignKey("traders.id"))
    symbol = Column(String, nullable=False)
    quantity = Column(Float, nullable=False)
    price = Column(Float, nullable=False)
    trader= relationship("Trader", back_populates="holdings")
    purchase_date = Column(DateTime(timezone=True), default=datetime.now(timezone.utc))

