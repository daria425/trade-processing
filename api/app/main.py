from fastapi import (
    FastAPI,
    HTTPException,
    Request,
    BackgroundTasks,
    WebSocket,
    WebSocketDisconnect,
)
from fastapi.middleware.cors import CORSMiddleware
from app.models.trade_request import TradeRequest
from app.core.trade_processing import TradeSystem
import asyncio

API_KEY_STORE = {
    "api-key-123": "trader_001",
    "api-key-456": "trader_002",
}


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
            await ws.send_json(message)

    async def broadcast(self, message):
        async with self.lock:
            for ws in self.clients.values():
                await ws.send_json(message)



app = FastAPI()


@app.middleware("http")
async def authenticate(request, call_next):
    api_key = request.headers.get("api-key")
    if not api_key:
        raise HTTPException(status_code=401, detail="API Key must be provided")
    if api_key not in API_KEY_STORE:
        raise HTTPException(status_code=403, detail="Invalid API Key")
    request.state.trader_id = API_KEY_STORE[api_key]
    response = await call_next(request)
    return response


origins = ["http://localhost:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def main():
    return {"Hello": "World"}


ws_manager_instance = WebsocketManager()


@app.post("/trades/send")
async def make_trade_order(
    request: Request, trade_request: TradeRequest, bg_tasks: BackgroundTasks
):
    try:
        trader_id = request.state.trader_id
        ticker = trade_request.ticker
        quantity = trade_request.quantity
        trade_system = TradeSystem()
        bg_tasks.add_task(
            trade_system.run,
            trader_id=trader_id,
            ticker=ticker,
            quantity=quantity,
            ws_manager=ws_manager_instance,
        )
        return {
            "status": "success",
            "processing": True,
            "message": "Trade recieved successfully",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def websocket_auth(websocket: WebSocket):
    api_key=websocket.headers.get("api-key")
    if not api_key:
        await websocket.close()
        return
    trader_id=API_KEY_STORE[api_key]
    return trader_id

@app.websocket("/trade-progress/ws")
async def ws_endpoint(websocket: WebSocket):
    trader_id=await websocket_auth(websocket)
    await ws_manager_instance.connect(websocket, trader_id)
    try:
        while True:
            await asyncio.sleep(60)  # Keeps the connection alive
    except WebSocketDisconnect:
        await ws_manager_instance.disconnect(websocket, trader_id)
