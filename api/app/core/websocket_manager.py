import asyncio
from fastapi import WebSocket

class WebsocketManager:
    def __init__(self):
        self.clients = {}
        self.lock = asyncio.Lock()

    async def connect(self, websocket: WebSocket, trader_id:str):
        await websocket.accept()
        async with self.lock:
            self.clients[trader_id]=websocket

    async def disconnect(self,trader_id:str):
        async with self.lock:
            self.clients.pop(trader_id, None)

    async def notify(self, trader_id, message):
        async with self.lock:
            ws=self.clients.get(trader_id)
            print(f"Sending message to trader {trader_id}: {message}")
            await ws.send_json(message)

    def has_active_connection(self, trader_id: str) -> bool:
        return trader_id in self.clients

    async def broadcast(self, message):
        async with self.lock:
            for ws in self.clients.values():
                await ws.send_json(message)