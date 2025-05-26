import json
import os
from pathlib import Path


current_dir = Path(__file__).parent.absolute()
db_path = os.path.join(current_dir, "db.json")


class NotificationService:
    def __init__(self):
        pass
    
    def _load_fake_db(self):
        FAKE_DB=None
        if os.path.exists(db_path):
            with open(db_path,"r") as f:
                FAKE_DB=json.load(f)
        return FAKE_DB
    
    def _get_trader(self, trader_id):
        FAKE_DB=self._load_fake_db()
        trader=next((record for record in FAKE_DB if record["trader_id"] == trader_id), None)
        return trader

    def send_notification(self, trader_id, ws_manager):
        trader=self._get_trader(trader_id)
        message={"message":"Trade completed!"}
        if trader:
            if trader['status']=="online":
                ws_manager.notify(message)
            else:
                # send mock phone notification
                for token in trader["notification_tokens"]:
                    self.send_push_notification(token, message)
    
    def send_push_notification(self,token, message):
        print(f"Notification sent to {token}: {message['message']}")




