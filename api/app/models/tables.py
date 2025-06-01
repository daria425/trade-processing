from app.db.database_connection import Base
from sqlalchemy.orm import relationship
from sqlalchemy import Column, String, ForeignKey, Boolean, DateTime, func
from datetime import datetime, timezone
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
