from app.db.database_connection import Base
from sqlalchemy.orm import relationship
from sqlalchemy import Column, String, ForeignKey, Boolean, Text
from sqlalchemy.dialects.postgresql import ARRAY
class Trader(Base):
    __tablename__ = "traders"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=True)
    status = Column(String, default="online")
    email = Column(String, nullable=True)
    notification_tokens=Column(ARRAY(String), nullable=True)


    notifications = relationship("Notification", back_populates="trader")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, index=True)
    message = Column(String)
    read = Column(Boolean, default=False)


    trader_id = Column(String, ForeignKey("traders.id"))
    trader = relationship("Trader", back_populates="notifications")
