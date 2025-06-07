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
  return <p>This is the trade progress component</p>;
}
