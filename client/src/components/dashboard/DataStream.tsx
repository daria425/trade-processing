import { marketDataWebsocketUrl } from "@/config/api.config";
import { useWebSocket } from "../../hooks/useWebSocket";
import { useEffect, useState } from "react";
import { useMarketDataStream } from "../../hooks/useMarketDataStream";
const MOCK_DATA = [
  {
    "ticker": "AAPL",
    "price": 200.66000366210938,
    "date": "2025-05-30 19:59:00",
  },
  {
    "ticker": "GOOGL",
    "price": 171.61000061035156,
    "date": "2025-05-30 19:59:00",
  },
  {
    "ticker": "AMZN",
    "price": 204.66000366210938,
    "date": "2025-05-30 19:59:00",
  },
  {
    "ticker": "MSFT",
    "price": 459.5899963378906,
    "date": "2025-05-30 19:59:00",
  },
  {
    "ticker": "TSLA",
    "price": 345.760009765625,
    "date": "2025-05-30 19:59:00",
  },
];
const TICKERS = ["AAPL", "GOOGL", "AMZN", "MSFT", "TSLA"];
export default function DataStream({
  getIdToken,
}: {
  getIdToken: () => Promise<string>;
}) {
  const [token, setToken] = useState<string | null>(null);

  // Fetch the token as soon as the component mounts
  useEffect(() => {
    const fetchToken = async () => {
      const token = await getIdToken();
      setToken(token);
    };

    fetchToken();
  }, []); // Only run once when the component mounts

  // Use the token in the WebSocket connection URL once it's available
  const websocketWithToken = token
    ? `${marketDataWebsocketUrl}?token=${token}`
    : null;

  const { status, message } = useWebSocket(websocketWithToken);
  const { initialMessage, marketData } = useMarketDataStream(
    status,
    message,
    token || "",
    TICKERS
  );
  console.log(initialMessage, marketData);
  return null;
}
