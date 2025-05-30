from uuid import uuid
from datetime import datetime, timezone
from app.models.tables import Notification
class NotificationService:
    def __init__(self):
        pass
    
    async def send_notification(self, trader, ws_manager, session):
        notification=Notification(trader_id=trader_id, message="Trade completed!", read=False,created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc))
        session.add(notification)
        await session.commit()
        message={
"id": str(notification.id),
"message": notification.message,
"created_at": notification.created_at.isoformat()
    }
        if trader:
            trader_id=trader.id
            if trader.status=="online":
                await ws_manager.notify(trader_id, message)
            else:
                for token in trader.notification_tokens:
                    self.send_push_notification(token, message, trader_id)
        return message
    
    def send_push_notification(self,token, message, trader_id):
        print(f"Notification sent to {token}: {message['message']}")




