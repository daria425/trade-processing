from fastapi import (
    FastAPI,
    Query,
    HTTPException,
    Request,
    BackgroundTasks,
    WebSocket,
    WebSocketDisconnect,
    Depends,
    Body,
)

from fastapi.responses import JSONResponse
from typing import List
from app.utils.auth_utils import get_token_data
from fastapi.middleware.cors import CORSMiddleware
from app.schemas.trade_request import TradeRequest
from app.schemas.signup_request import SignupRequest
from app.core.trade_processing import TradeSystem
from app.core.notifications import NotificationService
from app.core.websocket_manager import WebsocketManager
from app.models.tables import Trader, Notification
from app.config.firebase_config import FirebaseConfig
from app.utils.logger import logger
from app.db.database_connection import (
    engine,
    Base,
    AsyncSessionLocal,
    init_async_session,
)
from app.db.trader_store import signup_trader, login_trader, update_notification_token
from app.core.market_data import MarketDataStreamer
from dotenv import load_dotenv
import asyncio
import os

load_dotenv()
TEST_TRADER_ID = os.getenv("TEST_UID")


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        print("Database initialized")


async def lifespan(app: FastAPI):
    firebase_instance = FirebaseConfig.get_instance()
    firebase_instance.initialize_firebase_app()
    await init_db()
    yield


app = FastAPI(lifespan=lifespan)


@app.middleware("http")
async def authenticate(request: Request, call_next):
    public_paths = ["/"]  # Root path

    # Check if the current path should skip authentication
    path = request.url.path
    if path in public_paths:
        return await call_next(request)
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    token = auth_header.split("Bearer ")[-1]
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
market_data_ws_manager = WebsocketManager()


@app.post("/api/trader/signup")
async def signup_trader_endpoint(
    request: Request,
    sign_up_request: SignupRequest,
    session=Depends(init_async_session),
):
    try:
        user_data = request.state.user
        uid = user_data["uid"]
        email = user_data.get("email")
        name = sign_up_request.name
        signup_data = await signup_trader(
            uid=uid, email=email, name=name, session=session
        )
        new_trader = signup_data["trader"]
        trader_dict = {
            "id": new_trader.id,
            "trader_id": uid,
            "email": new_trader.email,
            "name": new_trader.name,
            "status": new_trader.status,
            "created_at": new_trader.created_at.isoformat(),
            "updated_at": new_trader.updated_at.isoformat(),
            "last_seen_at": (
                new_trader.last_seen_at.isoformat() if new_trader.last_seen_at else None
            ),
        }
        return JSONResponse(
            status_code=201,
            content={"message": "Trader signed up successfully", "trader": trader_dict, "holdings": signup_data["holdings"], "portfolio_value": signup_data["portfolio_value"]},
        )
    except Exception as e:
        logger.error(f"Error during trader signup: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/trader/login")
async def login_trader_endpoint(request: Request, session=Depends(init_async_session)):
    try:
        user_data = request.state.user
        uid = user_data["uid"]
        login_user_data = await login_trader(uid=uid, session=session)
        trader= login_user_data["trader"]
        trader_dict = {
            "id": trader.id,
            "trader_id": uid,
            "email": trader.email,
            "name": trader.name,
            "status": trader.status,
            "created_at": trader.created_at.isoformat(),
            "updated_at": trader.updated_at.isoformat(),
            "last_seen_at": (
                trader.last_seen_at.isoformat() if trader.last_seen_at else None
            ),
        }
        return JSONResponse(
            status_code=200,
            content={"message": "Trader logged in successfully", "trader": trader_dict, "holdings": login_user_data["holdings"], "portfolio_value": login_user_data["portfolio_value"]},
        )
    except Exception as e:
        logger.error(f"Error during trader login: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/trader/notification-token")
async def update_notification_token_endpoint(request: Request, notification_token: str = Body(..., embed=True), session=Depends(init_async_session)):
    try:
        user_data = request.state.user
        uid = user_data["uid"]
        await update_notification_token(uid=uid, token=notification_token, session=session)
        logger.info(f"Notification token updated for trader {uid}")
        return JSONResponse(
            status_code=200,
            content={"message": "Notification token updated successfully"},
        )
    except Exception as e:
        logger.error(f"Error updating notification token: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/trades/send")
async def make_trade_order(
    request: Request,
    trade_request: TradeRequest,
    bg_tasks: BackgroundTasks,
    notification_service=Depends(NotificationService),
):
    try:
        trader_id = request.state.user["uid"]
        ticker = trade_request.ticker
        quantity = trade_request.quantity
        trade_system = TradeSystem(sessionmaker=AsyncSessionLocal)
        bg_tasks.add_task(
            trade_system.run,
            trader_id=trader_id,
            ticker=ticker,
            quantity=quantity,
            ws_manager=ws_manager_instance,
            notification_service=notification_service,
        )
        return {
            "status": "success",
            "processing": True,
            "message": "Trade recieved successfully",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/market-data/")
# will run on useeffect from client side
async def get_market_data(
    request: Request,
    bg_tasks: BackgroundTasks,
    streamer=Depends(MarketDataStreamer),
    use_test_auth: bool = Query(False),
    ticker: List[str] = Query(..., description="List of stock tickers"),
):
    trader_id = request.state.user["uid"] if not use_test_auth else TEST_TRADER_ID
    bg_tasks.add_task(
        streamer.stream_price_data,
        trader_id=trader_id,
        tickers=ticker,
        ws_manager=market_data_ws_manager,
    )
    return {
        "status": "success",
        "message": f"Market data for {ticker} is being sent to the websocket.",
    }


async def websocket_auth(websocket:WebSocket, token:str, use_test_auth:bool = False):   
    if use_test_auth:
        return TEST_TRADER_ID
    user_data = get_token_data(token)

    if not user_data:
        await websocket.close(code=1008)
        raise HTTPException(status_code=401, detail="Invalid authentication")

    return user_data["uid"]


@app.websocket("/trade-progress/ws")
async def ws_endpoint(websocket: WebSocket, token: str=Query(..., description="Bearer token for authentication")):
    trader_id = await websocket_auth(websocket, token)
    await ws_manager_instance.connect(websocket, trader_id)
    try:
        while True:
            await asyncio.sleep(60)  # Keeps the connection alive
    except WebSocketDisconnect:
        await ws_manager_instance.disconnect(websocket, trader_id)


@app.websocket("/market-data/ws")
async def market_data_ws_endpoint(websocket: WebSocket, token: str = Query(..., description="Bearer token for authentication")):
    trader_id = await websocket_auth(websocket, token)
    await market_data_ws_manager.connect(websocket, trader_id)
    try:
        while True:
            try:
                await asyncio.sleep(60)  # Keeps the connection alive
            except asyncio.CancelledError:
                logger.info(f"WebSocket connection for trader {trader_id} closed.")
                break
    except WebSocketDisconnect:
        await market_data_ws_manager.disconnect(websocket, trader_id)
