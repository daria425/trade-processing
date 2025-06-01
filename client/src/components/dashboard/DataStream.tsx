import { marketDataWebsocketUrl } from "@/config/api.config";
import { useWebSocket } from "../../hooks/useWebSocket";
import { useEffect, useState } from "react";
import { useMarketDataStream } from "../../hooks/useMarketDataStream";
import MarketDataChart from "./MarketDataChart";
const MOCK_DATA = [
  [
    {
      "ticker": "AAPL",
      "price": 200.66000366210938,
      "date": "2025-06-01 16:29:59",
    },
    {
      "ticker": "GOOGL",
      "price": 171.61000061035156,
      "date": "2025-06-01 16:29:59",
    },
    {
      "ticker": "AMZN",
      "price": 204.66000366210938,
      "date": "2025-06-01 16:29:59",
    },
    {
      "ticker": "MSFT",
      "price": 459.5899963378906,
      "date": "2025-06-01 16:29:59",
    },
    {
      "ticker": "TSLA",
      "price": 345.760009765625,
      "date": "2025-06-01 16:29:59",
    },
  ],
  [
    {
      "ticker": "AAPL",
      "price": 200.66000366210938,
      "date": "2025-06-01 16:30:09",
    },
    {
      "ticker": "GOOGL",
      "price": 171.61000061035156,
      "date": "2025-06-01 16:30:09",
    },
    {
      "ticker": "AMZN",
      "price": 204.66000366210938,
      "date": "2025-06-01 16:30:09",
    },
    {
      "ticker": "MSFT",
      "price": 459.5899963378906,
      "date": "2025-06-01 16:30:09",
    },
    {
      "ticker": "TSLA",
      "price": 345.760009765625,
      "date": "2025-06-01 16:30:09",
    },
  ],
  [
    {
      "ticker": "AAPL",
      "price": 200.66000366210938,
      "date": "2025-06-01 16:30:19",
    },
    {
      "ticker": "GOOGL",
      "price": 171.61000061035156,
      "date": "2025-06-01 16:30:19",
    },
    {
      "ticker": "AMZN",
      "price": 204.66000366210938,
      "date": "2025-06-01 16:30:19",
    },
    {
      "ticker": "MSFT",
      "price": 459.5899963378906,
      "date": "2025-06-01 16:30:19",
    },
    {
      "ticker": "TSLA",
      "price": 345.760009765625,
      "date": "2025-06-01 16:30:19",
    },
  ],
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
  //   if (marketData.length === 0) {
  //     return (
  //       <div className="text-center text-gray-500">
  //         Waiting for market data...
  //       </div>
  //     );
  //   }
  return <MarketDataChart chartData={MOCK_DATA} />; // Use MOCK_DATA for now
}
