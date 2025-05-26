import json
import os
from pathlib import Path


current_dir = Path(__file__).parent.absolute()
trader_db_path = os.path.join(current_dir, "trader_db.json")
notification_db_path=os.path.join(current_dir, "notification_db.json")


class NotificationService:
    def __init__(self):
        pass
    
    def _load_fake_dbs(self):
        TRADER_DB=None
        NOTIFICATION_DB=None
        if os.path.exists(trader_db_path):
            with open(trader_db_path,"r") as f:
                TRADER_DB=json.load(f)
        if os.path.exists(notification_db_path):
            with open(trader_db_path,"r") as f:
                NOTIFICATION_DB=json.load(f)
        return TRADER_DB, NOTIFICATION_DB
    
    def _get_trader(self, trader_id):
        TRADER_DB=self._load_fake_dbs()[0]
        trader=next((record for record in TRADER_DB if record["trader_id"] == trader_id), None)
        return trader
    
    def _save_notification(self, message, trader_id):
        notification_data = {
            "trader_id": trader_id, 
            "message": message['message'],
            "status": "unread" 
        }
        _, NOTIFICATION_DB = self._load_fake_dbs()
        if NOTIFICATION_DB is None:
            NOTIFICATION_DB = []
        NOTIFICATION_DB.append(notification_data)
        with open(notification_db_path, "w") as f:
            json.dump(NOTIFICATION_DB, f, indent=4)
        print(f"Notification sent to {trader_id} saved")
        

    async def send_notification(self, trader_id, ws_manager):
        trader=self._get_trader(trader_id)
        message={"message":"Trade completed!"}
        if trader:
            if trader['status']=="online":
                await ws_manager.notify(trader_id, message)
            else:
                # send mock phone notification
                for token in trader["notification_tokens"]:
                    self.send_push_notification(token, message, trader_id)
    
    def send_push_notification(self,token, message, trader_id):
        print(f"Notification sent to {token}: {message['message']}")




