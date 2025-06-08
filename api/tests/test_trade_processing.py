
import time
from app.core.trade_processing import Stock, StockTrade, Trader

def test_stock_creation():
    """Test that Stock objects are created correctly."""
    stock = Stock("AAPL", 190.50)
    assert stock.ticker == "AAPL"
    assert stock.price == 190.50

def test_trader_creation():
    """Test that Trader objects are created correctly."""
    trader = Trader(trader_id="test_trader", status="online", email="test@example.com", name="Test Trader")
    assert trader.trader_id == "test_trader"
    assert trader.status == "online"
    assert trader.email == "test@example.com"
    assert trader.name == "Test Trader"
    assert isinstance(trader.notification_tokens, list)
    assert len(trader.notification_tokens) == 0

def test_create_trade_order():
    """Test that trade orders are created correctly."""
    trader = Trader(trader_id="test_trader")
    stock = Stock("AAPL", 190.50)
    trade = trader.make_trade_order(stock, 10, "buy")
    
    assert trade.trader_id == "test_trader"
    assert trade.stock.ticker == "AAPL"
    assert trade.stock.price == 190.50
    assert trade.quantity == 10
    assert trade.trade_type == "buy"
    assert trade.status == "queued"
    assert isinstance(trade.id, str)

def test_trade_lifecycle():
    """Test the lifecycle of a trade (start, progress, complete)."""
    trader = Trader(trader_id="test_trader")
    stock = Stock("AAPL", 190.50)
    trade = trader.make_trade_order(stock, 10, "buy")
    
    # Initial state
    assert trade.status == "queued"
    assert trade.get_progress() == 0.0
    
    # Start trade
    trade.start()
    assert trade.status == "in_progress"
    assert trade.timestamp is not None
    assert trade.get_progress() > 0.0  # Progress should have started
    
    # Complete trade
    trade.latency = 0.1  # Override latency for testing
    trade.timestamp = time.time()-1.0  # Ensure progress is 100%
    assert trade.get_progress() >= 1.0  # Should be complete
    
    trade.complete()
    assert trade.status == "completed"
    assert trade.get_progress() == 0.0

def test_buy_trade_constraints():
    """Test that buy trades have proper constraints."""
    stock = Stock("AAPL", 190.50)
    trade = StockTrade("test_trader", stock, 10, "buy")
    
    assert trade.trade_type == "buy"
    assert trade.quantity > 0  # Buy quantity should be positive

def test_sell_trade_constraints():
    """Test that sell trades have proper constraints."""
    stock = Stock("AAPL", 190.50)
    trade = StockTrade("test_trader", stock, 10, "sell")
    
    assert trade.trade_type == "sell"
    assert trade.quantity > 0