
from app.core.websocket_manager import WebsocketManager
from app.utils.logger import logger
import asyncio
from typing import Set, Tuple
from app.core.stock_search import get_multiple_price_data
class MarketDataStreamer:
    def __init__(self):
        self.active_streams: Set[Tuple[str, Tuple[str, ...]]] = set()


    async def stream_price_data(self, tickers: list, trader_id:str, ws_manager:WebsocketManager):
        """
        Asynchronously fetches the latest price data for a given stock ticker.
        
        :param ticker: Stock ticker symbol (e.g., 'AAPL', 'GOOGL')
        :param trader_id: Unique identifier for the trader
        :param ws_manager: Websocket manager instance to send data
        :return: Dictionary with latest price data
        """
        key=(trader_id, tuple(sorted(tickers)))
        if key in self.active_streams:
            logger.info(f"Stream for {key} is already active, skipping new stream.")
            return
        self.active_streams.add(key)
        logger.info(f"Starting stream for {trader_id} with tickers {tickers}")
        try:
            while True:
                if not ws_manager.has_active_connection(trader_id):
                    logger.info(f"No active websocket connection for trader {trader_id}, stopping stream.")
                    break
                try:
                        data = get_multiple_price_data(tickers)
                        success=await ws_manager.notify(trader_id, data)
                        if not success:
                            break
                except asyncio.CancelledError:
                        logger.info(f"Market data stream for trader {trader_id} cancelled")
                        raise  # Re-raise to trigger cleanup
                except Exception as e:
                        logger.error(f"Error while sending price data: {str(e)}")
                        # If error occurs, check connection before continuing
                        if not ws_manager.has_active_connection(trader_id):
                            break
                            
                await asyncio.sleep(10)
        except asyncio.CancelledError:
            logger.info(f"Market data stream for trader {trader_id} cancelled")
            # Let the cancellation propagate after cleanup
            raise
        except Exception as e:
            logger.error(f"Error in market data stream for trader {trader_id}: {str(e)}")
        finally:
            # Always clean up, even if there's an error
            if key in self.active_streams:
                self.active_streams.remove(key)
            logger.info(f"Stopped market data stream for trader {trader_id}")



