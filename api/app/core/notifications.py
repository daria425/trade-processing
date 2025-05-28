
class NotificationService:
    def __init__(self):
        pass
    
    async def send_notification(self, trader, ws_manager):
        message={"message":"Trade completed!"}
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




