
from datetime import datetime, timezone
from app.models.tables import Notification
class NotificationService:
    def __init__(self):
        pass
    
    async def send_notification(self, trader, trade, ws_manager, session):
        trader_id=trader.id if trader else None
        notification=Notification(trader_id=trader_id, message="Trade completed!", read=False,created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc))
        session.add(notification)
        await session.commit()
        message={
"trader_id": trader_id,
"trade_id": trade.id,
"ticker": trade.stock.ticker,
"quantity": trade.quantity,
"message": notification.message,
"event": "trade_completed",
"progress": 100,
"status":"success"
    }
        if trader:
            if trader.status=="online":
                await ws_manager.notify(trader_id, message)
            else:
                for token in trader.notification_tokens:
                    self.send_push_notification(token, message, trader_id)
        return message
    
    def send_push_notification(self,token, message, trader_id):
        print(f"Notification sent to {token}: {message['message']}")




