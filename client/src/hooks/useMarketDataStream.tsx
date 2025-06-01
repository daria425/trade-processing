import { useState, useEffect } from "react";
import { apiConfig } from "../config/api.config";
import type {
  WebSocketStatus,
  InitialResponse,
} from "../types/websocket.types";
interface MarketDataPoint {
  ticker: string;
  price: number;
  date: string;
}
function useMarketDataStream(
  websocketStatus: WebSocketStatus,
  marketDataMessage: Array<MarketDataPoint> | null,
  token: string,
  tickers: string[]
) {
  const [initialMessage, setInitialMessage] = useState<InitialResponse>({
    status: "",
    message: "",
  });
  const [marketData, setMarketData] = useState<Array<MarketDataPoint[]>>([]);
  useEffect(() => {
    if (websocketStatus.connected && token) {
      // Build the query string for multiple tickers
      const queryParams = tickers.map((t) => `ticker=${t}`).join("&");
      const url = `/api/market-data/?${queryParams}`;

      apiConfig
        .get(url, { headers: { Authorization: `Bearer ${token}` } })
        .then((response) => {
          setInitialMessage(response.data);
        })
        .catch((error) => {
          console.error("Error fetching initial data:", error);
        });
    }
  }, [websocketStatus.connected, token, tickers]); // Only run when WebSocket connects

  useEffect(() => {
    if (marketDataMessage && marketDataMessage.length > 0) {
      console.log("📡 Live data:", marketDataMessage);
      setMarketData((prevData) => [
        ...prevData,
        marketDataMessage as MarketDataPoint[],
      ]);
    }
  }, [marketDataMessage]);
  return { initialMessage, marketData };
}

export { useMarketDataStream };
