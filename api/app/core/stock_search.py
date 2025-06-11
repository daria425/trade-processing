import yfinance as yf



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
        
        
    
