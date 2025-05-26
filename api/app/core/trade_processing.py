from typing import Literal, List
import asyncio
from asyncio import Task
from app.core.notifications import NotificationService
import time
import random
import uuid


class Stock:
    def __init__(self, ticker):
        self.ticker = ticker

    def get_price(self):
        price = random.uniform(80.0, 200.0)
        return price


class StockTrade:
    def __init__(
        self,
        trader_id: str,
        stock: Stock,
        quantity: int,
        status: Literal["queued", "in_progress", "filled"] = "queued",
    ):
        """
        Wrapper around a single stock trade
            :param stock: Traded stock
            :param quantity: Trade quantity (number of shares)
            :param status: Execution status
        """
        self.id = str(uuid.uuid4())
        self.trader_id = trader_id
        self.latency = random.uniform(1.0, 3.0)  # Random latency between 1-3 seconds
        self.status = status
        self.quantity = quantity
        self.timestamp = None  # start time
        self.stock = stock

    def start(self):
        print("Trade started")
        self.timestamp = time.time()
        self.status = "in_progress"

    def get_progress(self):
        elapsed_time = time.time() - self.timestamp
        progress = min(elapsed_time / self.latency, 1.0)
        return progress

    def complete(self):
        self.status = "filled"
        self.timestamp = None
        print("Trade filled")


class Trader:
    def __init__(
        self,
        trader_id: str,
        status: Literal["online", "offline"] = "online",
        email=None,
        name=None,
    ):
        self.trader_id = trader_id
        self.status = status
        self.id = str(uuid.uuid4())
        self.email = email  # ill add later
        self.name = name  # add later
        self.notification_tokens: List[str] = []

    def make_trade_order(self, stock: Stock, quantity: int) -> StockTrade:
        return StockTrade(self.id, stock, quantity)


class TradeSystem:
    def __init__(self, num_processors: int = 5):
        self.trade_orders = asyncio.Queue()
        self.progress_queue = asyncio.Queue()
        self.num_processors = num_processors
        self.processors: List[Task] = []
        self.shutdown_flag = False

    async def add_trade_order(self, trade_order: StockTrade):
        await self.trade_orders.put(trade_order)

    async def process_trade(self, processor_id, ws_manager, trader_id, notification_service):
        while not self.shutdown_flag:
            try:
                trade = await self.trade_orders.get()
                trade.start()
                interval = 0.5
                while trade.get_progress() < 1.0:
                    await asyncio.sleep(interval)
                    progress = trade.get_progress() * 100
                    print(
                        f"[Processor: {processor_id}]Processing trade:{trade.id} for {trade.quantity} shares of {trade.stock.ticker}, Progress:{progress}"
                    )
                    message = {
                        "event": "trade_progress",
                        "trade_id": trade.id,
                        "trader_id": trader_id,
                        "ticker": trade.stock.ticker,
                        "quantity": trade.quantity,
                        "progress": round(progress, 2),
                        "status": trade.status,
                    }
                    await ws_manager.broadcast(message)
                trade.complete()
                await notification_service.send_notification(trader_id)
                self.trade_orders.task_done()
            except asyncio.TimeoutError:
                continue
            except Exception as e:
                print(f"Error in processor {processor_id}: {e}")
                if trade:
                    self.trade_orders.task_done()

    async def start_processors(self, ws_manager, trader_id, notification_service):
        for i in range(self.num_processors):
            trade_execution_task = asyncio.create_task(
                self.process_trade(i, ws_manager, trader_id, notification_service)
            )
            self.processors.append(trade_execution_task)

    async def process_all_orders(self):
        await self.trade_orders.join()

    async def shutdown(self):
        self.shutdown_flag = True
        print("Shutting down...")
        if self.processors:
            await asyncio.sleep(1.0)
            for trade_execution_task in self.processors:
                trade_execution_task.cancel()
            await asyncio.gather(*self.processors, return_exceptions=True)
            self.processors = []
        print("All trade processors shut down successfully")

    async def run(self, trader_id: str, ticker: str, quantity: int, ws_manager, notification_service: NotificationService):
        try:
            trader = Trader(trader_id=trader_id)
            stock = Stock(ticker=ticker)
            trade = trader.make_trade_order(stock, quantity)
            await self.start_processors(ws_manager=ws_manager, trader_id=trader_id, notification_service=notification_service)
            await self.add_trade_order(trade)
            await self.process_all_orders()
        except Exception as e:
            print("An error ocurred in trade system", str(e))
        finally:
            await self.shutdown()
