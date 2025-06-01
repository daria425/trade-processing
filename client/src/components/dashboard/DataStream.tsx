import { marketDataWebsocketUrl } from "@/config/api.config";
import { useWebSocket } from "../../hooks/useWebSocket";
import { useEffect, useState } from "react";
import { useMarketDataStream } from "../../hooks/useMarketDataStream";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import MarketDataChart from "./MarketDataChart";

const TICKERS = ["AAPL", "GOOGL", "AMZN", "MSFT", "TSLA"];

function ChartError() {
  return (
    <div className="flex flex-col items-center justify-center h-[400px] w-full">
      <div className="relative"></div>
      <div className="mt-6 bg-slate-800 bg-opacity-50 px-6 py-3 rounded-lg">
        <p className="text-red-300 font-medium text-sm">
          Oops! An error occurred while fetching market data
        </p>
      </div>
    </div>
  );
}
function ChartLoader() {
  return (
    <div className="flex flex-col items-center justify-center h-[400px] w-full">
      <div className="relative">
        <div className="h-20 w-20 rounded-full border-t-4 border-b-4 border-violet-500 animate-spin"></div>
        <div className="absolute top-0 left-0 h-20 w-20 rounded-full border-r-4 border-l-4 border-indigo-400 animate-pulse"></div>
      </div>
      <div className="mt-6 bg-slate-800 bg-opacity-50 px-6 py-3 rounded-full">
        <p className="text-violet-200 font-medium text-sm animate-pulse">
          Loading market data
          <span className="inline-flex">
            <span className="animate-blink mx-0.5">.</span>
            <span className="animate-blink animation-delay-300 mx-0.5">.</span>
            <span className="animate-blink animation-delay-600 mx-0.5">.</span>
          </span>
        </p>
      </div>
      <div className="mt-8 grid grid-cols-5 gap-2">
        {TICKERS.map((ticker) => (
          <div
            key={ticker}
            className="bg-slate-800 px-3 py-1 rounded-md text-center"
          >
            <span className="text-xs font-mono text-slate-400">{ticker}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
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
  const { marketData, error } = useMarketDataStream(
    status,
    message,
    token || "",
    TICKERS
  );
  return (
    <Card className="bg-slate-900 text-white border-1 border-slate-800 sm:min-w-[400px]">
      <CardHeader>
        <CardTitle>Market Data Stream</CardTitle>
        <CardDescription>Live market data for selected tickers</CardDescription>
      </CardHeader>
      <CardContent>
        {error || status.error ? (
          <ChartError />
        ) : marketData.length > 0 ? (
          <MarketDataChart chartData={marketData} />
        ) : (
          <ChartLoader />
        )}
      </CardContent>
    </Card>
  );
}
