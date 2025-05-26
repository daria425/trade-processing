# Stock Trade (e.g., Buy/Sell order)
# Trade Execution Time (e.g., latency)
# Trade Order
# Trade Processor / Execution Engine
# Trade Execution Queue
# Trade Fill Progress / Execution Status
from typing import Literal
import asyncio
import time
import random
import uuid
class Stock:
    def __init__(self, ticker, price):
        self.ticker=ticker
        self.price=price

class StockTrade:
    def __init__(self,  stock: Stock, quantity:int, status: Literal["queued", "in_progress", "filled"]="queued"):
        """
        Wrapper around a single stock trade
            :param stock: Traded stock
            :param quantity: Trade quantity (number of shares)
            :param status: Execution status
        """
        self.id=str(uuid.uuid4())
        self.latency = random.uniform(1.0, 3.0)  # Random latency between 1-3 seconds
        self.status=status
        self.quantity=quantity
        self.timestamp=None # start time
        self.stock=stock

    def start(self):
        print("Trade started")
        self.timestamp=time.time()
        self.status="in_progress"

    def get_progress(self):
        elapsed_time=time.time()-self.timestamp
        progress=min(elapsed_time/self.latency, 1.0)
        return progress
    
    def complete(self):
        self.status="filled"
        self.timestamp=None
        print("Trade filled")



class TradeSystem:
    def __init__(self, num_processors:int=5):
        self.trade_orders=asyncio.Queue()
        self.num_processors=num_processors
        self.processors=[]

    async def add_trade_order(self, trade_order: StockTrade):
        await self.trade_orders.put(trade_order)
    
    async def process_trade(self, processor_id):
        while True:
            trade=await self.trade_orders.get()
            trade.start()
            interval=0.5
            while trade.get_progress()<1.0:
                await asyncio.sleep(interval)
                progress=trade.get_progress()*100
                print(f"[Processor: {processor_id}]Processing trade:{trade.id} for {trade.quantity} shares of {trade.stock.ticker}, Progress:{progress}")
            trade.complete()
            self.trade_orders.task_done()

    async def start_processors(self):
        for i in range(self.num_processors):
            trade_execution_task=asyncio.create_task(self.process_trade(i))
            self.processors.append(trade_execution_task)

    async def process_all_orders(self):
        await self.trade_orders.join()

async def main():
    appl=Stock("AAPL", 100.8) # later get from API
    trade=StockTrade(appl, 50)
    trade_system=TradeSystem()
    await trade_system.start_processors()
    await trade_system.add_trade_order(trade)
    await trade_system.process_all_orders()



if __name__=="__main__":
    asyncio.run(main())

