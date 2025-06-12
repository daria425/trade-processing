import yfinance as yf
import pandas as pd
import math
from app.utils.date_utils import create_timestamp
from app.utils.logger import logger


def lookup_stock(symbol: str, result_length:int=5) -> dict:
    """
    Lookup stock information by symbol.
    
    :param symbol: Stock symbol to lookup.
    :return: Stock information as a dictionary.
    """
    found_stocks = yf.Lookup(symbol).stock
    if found_stocks.empty:
        raise ValueError(f"Stock with symbol {symbol} not found.")
    filtered_stocks=found_stocks[~found_stocks.index.str.contains('\.')]
    if filtered_stocks.empty:
        raise ValueError(f"Stock with symbol {symbol} not found.")
    if len(filtered_stocks) > result_length:
        filtered_stocks = filtered_stocks[:result_length]
    print(filtered_stocks.columns)
    stock_list=[]
    for symbol in filtered_stocks.index:
        data=filtered_stocks.loc[symbol]
        stock_info = {
            "symbol": symbol,
            "name": data.get("shortName", ""),
        }
        stock_list.append(stock_info)
    return stock_list
        
        

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
            timestamp = create_timestamp 
            
            # Handle values whether they're single values or Series objects
            def safe_float(value):
                if hasattr(value, "iloc"):  # Check if it's a Series
                    value=float(value.iloc[0])
                value=float(value)
                return value if not math.isnan(value) else None
            # Create result dictionary with safely converted values
            result = {
                "ticker": ticker,
                "price": safe_float(latest_row["Close"]),
                "date": timestamp
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
            timestamp = create_timestamp()
            
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
                    "date": timestamp
                }
            else:
                # Multiple tickers - data is organized with MultiIndex columns
                for ticker in tickers:
                    try:
                        # Extract data for this ticker from the last row
                        price = float(data["Close", ticker].iloc[-1])
                        
                        results[ticker] = {
                            "ticker": ticker,
                            "price": None if math.isnan(price) else price,
                            "date": timestamp
                        }
                    except Exception as e:
                        # Handle case where a particular ticker might be missing
                        results[ticker] = {
                            "ticker": ticker,
                            "price": None,
                            "date": timestamp,
                            "error": f"Error processing ticker data: {str(e)}"
                        }
            
            return list(results.values())
            
        except Exception as e:
            logger.error(f"Error fetching price data for tickers {tickers}: {e}")
            return {ticker: {"ticker": ticker, "price": None, "date": None, "error": f"Download failed: {str(e)}"} for ticker in tickers}