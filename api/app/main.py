from fastapi import (
    FastAPI,
    HTTPException,
    Request,
    BackgroundTasks,
    WebSocket,
    WebSocketDisconnect,
    Depends
)
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.utils.auth_utils import get_token_data
from fastapi.middleware.cors import CORSMiddleware
from app.schemas.trade_request import TradeRequest
from app.core.trade_processing import TradeSystem
from app.core.notifications import NotificationService
from app.core.websocket_manager import WebsocketManager
from app.models.tables import Trader, Notification
from app.db.database_connection import engine, Base, AsyncSessionLocal
import asyncio

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        print("Database initialized")


async def lifespan(app:FastAPI):
    await init_db()
    yield

app = FastAPI(lifespan=lifespan)


@app.middleware("http")
async def authenticate(request:Request, call_next):
    auth_header = request.headers.get("Authorization")
    if not auth_header:
            raise HTTPException(status_code=401, detail="Authorization header missing")
    token = auth_header.split('Bearer ')[-1]
    try:
        user_data = get_token_data(token)
        
        # Store user in request state for access in route handlers
        request.state.user = user_data
        response = await call_next(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")



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
    request: Request, trade_request: TradeRequest, bg_tasks: BackgroundTasks, notification_service=Depends(NotificationService)
):
    # update to include session
    try:
        trader_id = request.state.trader_id
        ticker = trade_request.ticker
        quantity = trade_request.quantity
        trade_system = TradeSystem(sessionmaker=AsyncSessionLocal)
        bg_tasks.add_task(
            trade_system.run,
            trader_id=trader_id,
            ticker=ticker,
            quantity=quantity,
            ws_manager=ws_manager_instance,
            notification_service=notification_service
        )
        return {
            "status": "success",
            "processing": True,
            "message": "Trade recieved successfully",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def websocket_auth(websocket: WebSocket):
    auth_header = websocket.headers.get("Authorization")
    if not auth_header:
        await websocket.close(code=1008) 
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    token = auth_header.split('Bearer ')[-1]
    user_data = get_token_data(token)
    
    if not user_data:
        await websocket.close(code=1008)
        raise HTTPException(status_code=401, detail="Invalid authentication")
    
    return user_data["uid"]

@app.websocket("/trade-progress/ws")
async def ws_endpoint(websocket: WebSocket):
    trader_id=await websocket_auth(websocket)
    await ws_manager_instance.connect(websocket, trader_id)
    try:
        while True:
            await asyncio.sleep(60)  # Keeps the connection alive
    except WebSocketDisconnect:
        await ws_manager_instance.disconnect(websocket, trader_id)
