import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from app.db.trader_store import update_on_trade
from sqlalchemy import select
from app.models.tables import Holding

@pytest.mark.asyncio
async def test_update_on_trade_insufficient_funds():
    """Test that buying with insufficient funds raises a ValueError."""
    # Create mock objects
    mock_session = AsyncMock()
    mock_trader = MagicMock()
    mock_trader.id = "test_trader"
    mock_trader.cash_balance = 100  # Only $100 available
    
    # Setup the get_trader_by_id mock to return our mock trader
    with patch('app.db.trader_store.get_trader_by_id', return_value=mock_trader):
        # Try to buy stock worth more than available funds
        with pytest.raises(ValueError, match="Insufficient cash balance for this trade"):
            await update_on_trade(
                trader_id="test_trader",
                trade_type="buy",
                quantity=10,
                price=20,  # Total cost: $200
                symbol="AAPL",
                session=mock_session
            )

@pytest.mark.asyncio
async def test_update_on_trade_insufficient_holdings():
    """Test that selling more than owned raises a ValueError."""
    # Create mock objects
    mock_session = AsyncMock()
    mock_trader = MagicMock()
    mock_trader.id = "test_trader"
    
    # Setup mock for the holding query
    mock_holding = None  # No existing holdings
    mock_execute = AsyncMock(return_value=AsyncMock(scalar_one_or_none=lambda: mock_holding))
    mock_session.execute = mock_execute
    
    # Setup the get_trader_by_id mock
    with patch('app.db.trader_store.get_trader_by_id', return_value=mock_trader):
        # Try to sell stock that isn't owned
        with pytest.raises(ValueError, match="Insufficient holdings to sell"):
            await update_on_trade(
                trader_id="test_trader",
                trade_type="sell",
                quantity=5,
                price=100,
                symbol="AAPL",
                session=mock_session
            )

@pytest.mark.asyncio
async def test_update_on_trade_insufficient_quantity():
    """Test that selling more shares than owned raises a ValueError."""
    # Create mock objects
    mock_session = AsyncMock()
    mock_trader = MagicMock()
    mock_trader.id = "test_trader"
    
    # Setup mock for the holding query with insufficient quantity
    mock_holding = MagicMock()
    mock_holding.quantity = 2  # Only own 2 shares
    mock_execute = AsyncMock(return_value=AsyncMock(scalar_one_or_none=lambda: mock_holding))
    mock_session.execute = mock_execute
    
    # Setup the get_trader_by_id mock
    with patch('app.db.trader_store.get_trader_by_id', return_value=mock_trader):
        # Try to sell more stock than owned
        with pytest.raises(ValueError, match="Insufficient holdings to sell"):
            await update_on_trade(
                trader_id="test_trader",
                trade_type="sell",
                quantity=5,  # Trying to sell 5 shares
                price=100,
                symbol="AAPL",
                session=mock_session
            )