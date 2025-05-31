import yfinance as yf
from app.core.websocket_manager import WebsocketManager
from app.utils.logger import logger
import asyncio
from typing import Set, Tuple
import pandas as pd

class MarketDataStreamer:
    def __init__(self):
        self.active_streams: Set[Tuple[str, Tuple[str, ...]]] = set()

    @staticmethod
    def get_price_data(ticker: str):
        """
        Fetches the latest price and date for a given stock ticker.
        
        :param ticker: Stock ticker symbol (e.g., 'AAPL', 'GOOGL')
        :return: Dictionary with latest price data
        """
        # Fetch historical data for the ticker
        try:
            data = yf.download([ticker], period="1d", interval="1m")
            
            if data.empty:
                raise ValueError(f"No data found for ticker: {ticker}")
            
            # Get the last row of data
            latest_row = data.iloc[-1]
            timestamp = data.index[-1]
            
            # Handle values whether they're single values or Series objects
            def safe_float(value):
                if hasattr(value, "iloc"):  # Check if it's a Series
                    return float(value.iloc[0])
                return float(value)
            # Create result dictionary with safely converted values
            result = {
                "ticker": ticker,
                "price": safe_float(latest_row["Close"]),
                "date": timestamp.strftime('%Y-%m-%d %H:%M:%S')
            }
            
            return result
        except Exception as e:
            logger.error(f"Error fetching price data for {ticker}: {e}")
            return {
            "ticker": ticker,
            "price": None,
            "date": None,
            "error": f"Download failed: {str(e)}"
            }
    @staticmethod
    def get_multiple_price_data(tickers: list):
        """
        Fetches the latest price and date for multiple stock tickers.
        
        :param tickers: List of stock ticker symbols (e.g., ['AAPL', 'GOOGL'])
        :return: Dictionary with latest price data for each ticker
        """
        try:
            # Fetch historical data for multiple tickers
            data = yf.download(tickers, period="1d", interval="1m")
            
            if data.empty:
                return {ticker: {"ticker": ticker, "price": None, "date": None, "error": "No data found"} for ticker in tickers}
            
            # Get the last timestamp
            timestamp = data.index[-1]
            
            # Create result dictionary
            results = {}
            
            # Handle different structures based on whether we have one or multiple tickers
            if len(tickers) == 1:
                # Single ticker - simpler structure
                ticker = tickers[0]
                latest_row = data.iloc[-1]
                
                results[ticker] = {
                    "ticker": ticker,
                    "price": float(latest_row["Close", ticker].iloc[-1]) if isinstance(latest_row["Close", ticker], pd.Series) else float(latest_row["Close", ticker]),
                    "date": timestamp.strftime('%Y-%m-%d %H:%M:%S')
                }
            else:
                # Multiple tickers - data is organized with MultiIndex columns
                for ticker in tickers:
                    try:
                        # Extract data for this ticker from the last row
                        price = float(data["Close", ticker].iloc[-1])
                        
                        results[ticker] = {
                            "ticker": ticker,
                            "price": price,
                            "date": timestamp.strftime('%Y-%m-%d %H:%M:%S')
                        }
                    except Exception as e:
                        # Handle case where a particular ticker might be missing
                        results[ticker] = {
                            "ticker": ticker,
                            "price": None,
                            "date": timestamp.strftime('%Y-%m-%d %H:%M:%S'),
                            "error": f"Error processing ticker data: {str(e)}"
                        }
            
            return list(results.values())
            
        except Exception as e:
            logger.error(f"Error fetching price data for tickers {tickers}: {e}")
            return {ticker: {"ticker": ticker, "price": None, "date": None, "error": f"Download failed: {str(e)}"} for ticker in tickers}

    async def stream_price_data(self, tickers: list, trader_id:str, ws_manager:WebsocketManager):
        """
        Asynchronously fetches the latest price data for a given stock ticker.
        
        :param ticker: Stock ticker symbol (e.g., 'AAPL', 'GOOGL')
        :return: Dictionary with latest price data
        """
        if trader_id in self.active_streams:
            logger.warning(f"Stream for trader {trader_id} already active for ticker {ticker}.")
            return
        key=(trader_id, tuple(sorted(tickers)))
        self.active_streams.add(key)
        try:
            while True:
                        data=self.get_multiple_price_data(tickers)
                        await ws_manager.notify(trader_id, data)
                        await asyncio.sleep(10)
        except Exception as e:
                    print(f"Error while sending price data: {e}")
        finally:
                 self.active_streams.remove(key)


