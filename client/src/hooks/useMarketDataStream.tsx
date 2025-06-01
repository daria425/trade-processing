import { useState, useEffect } from "react";
import { apiConfig } from "../config/api.config";
import type {
  WebSocketStatus,
  InitialResponse,
  MarketDataPoint,
} from "../types/websocket.types";
import { AxiosError } from "axios";
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
  const [error, setError] = useState<string | null>(null);
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
        .catch((error: AxiosError<{ message?: string }>) => {
          console.error("Error fetching initial data:", error);
          setError(
            error.response?.data?.message || "Failed to fetch market data"
          );
        });
    }
  }, [websocketStatus.connected, token, tickers]); // Only run when WebSocket connects

  useEffect(() => {
    if (marketDataMessage && marketDataMessage.length > 0) {
      setMarketData((prevData) => [
        ...prevData,
        marketDataMessage as MarketDataPoint[],
      ]);
    }
  }, [marketDataMessage]);
  return { initialMessage, marketData, error };
}

export { useMarketDataStream };
