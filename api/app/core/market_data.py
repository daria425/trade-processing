import yfinance as yf
from app.core.websocket_manager import WebsocketManager
import asyncio
def get_price_data(ticker: str):
    """
    Fetches the latest price and date for a given stock ticker.
    
    :param ticker: Stock ticker symbol (e.g., 'AAPL', 'GOOGL')
    :return: Dictionary with latest price data
    """
    # Fetch historical data for the ticker
    data = yf.download([ticker], period="1d", interval="1m")
    
    if data.empty:
        return {
            "ticker": ticker,
            "price": None,
            "date": None,
            "error": "No data available"
        }
    
    # Get the last row of data
    latest_row = data.iloc[-1]
    timestamp = data.index[-1]
    
    # Handle values whether they're single values or Series objects
    def safe_float(value):
        if hasattr(value, "iloc"):  # Check if it's a Series
            return float(value.iloc[0])
        return float(value)
    
    def safe_int(value):
        if hasattr(value, "iloc"):  # Check if it's a Series
            return int(value.iloc[0])
        return int(value)
    
    # Create result dictionary with safely converted values
    result = {
        "ticker": ticker,
        "price": safe_float(latest_row["Close"]),
        "open": safe_float(latest_row["Open"]),
        "high": safe_float(latest_row["High"]),
        "low": safe_float(latest_row["Low"]),
        "volume": safe_int(latest_row["Volume"]),
        "date": timestamp.strftime('%Y-%m-%d %H:%M:%S')
    }
    
    return result

async def send_price_data(ticker: str, trader_id:str, ws_manager:WebsocketManager):
    """
    Asynchronously fetches the latest price data for a given stock ticker.
    
    :param ticker: Stock ticker symbol (e.g., 'AAPL', 'GOOGL')
    :return: Dictionary with latest price data
    """
    while True:
        try:
            data=get_price_data(ticker)
            await ws_manager.notify(trader_id, data)
        except Exception as e:
            print(f"Error while sending price data: {e}")
        await asyncio.sleep(10)


