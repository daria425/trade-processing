import { useWebSocket } from "../../hooks/useWebSocket";
import { useEffect, useState } from "react";
import { tradeProgressWebsocketUrl } from "../../config/api.config";

export default function TradeProgress({
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
  }, []);
  const websocketWithToken = token
    ? `${tradeProgressWebsocketUrl}?token=${token}`
    : null;

  const { status, message } = useWebSocket(websocketWithToken);
  console.log("Trade Progress WebSocket Status:", status);
  console.log("Trade Progress WebSocket Message:", message);
  return (
    <div className="text-center p-6">
      <h2 className="text-xl font-semibold text-indigo-600 mb-4">
        Trade Progress
      </h2>
      {status.connected && message ? (
        <div className="space-y-4">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Connected
          </div>

          <div className="bg-gray-700 p-4 rounded-lg text-left space-y-2">
            <p className="grid grid-cols-2 gap-2">
              <span className="text-gray-400">Trade ID:</span>
              <span className="font-mono">{message.trade_id}</span>
            </p>
            <p className="grid grid-cols-2 gap-2">
              <span className="text-gray-400">Ticker:</span>
              <span className="font-medium">{message.ticker}</span>
            </p>
            <p className="grid grid-cols-2 gap-2">
              <span className="text-gray-400">Quantity:</span>
              <span>{message.quantity}</span>
            </p>
            <p className="grid grid-cols-2 gap-2">
              <span className="text-gray-400">Status:</span>
              <span>{message.status}</span>
            </p>

            {/* Progress bar */}
            <div className="pt-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Progress</span>
                <span className="text-indigo-400">{message.progress}%</span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div
                  className="bg-indigo-500 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${message.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <div className="h-20 w-20 rounded-full border-t-4 border-b-4 border-violet-500 animate-spin"></div>
            <div className="absolute top-0 left-0 h-20 w-20 rounded-full border-r-4 border-l-4 border-indigo-400 animate-pulse"></div>
          </div>
          <p className="text-gray-400 text-sm">
            Connecting to trade service...
          </p>
        </div>
      )}
    </div>
  );
}
