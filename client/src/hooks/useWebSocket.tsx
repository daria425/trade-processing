import { useState, useEffect, useRef } from "react";

function useWebSocket(url: string | null) {
  const connection = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState({ connected: false, error: false });
  const [message, setMessage] = useState<{
    trader_id: string;
    trade_id: string;
    ticker: string;
    quantity: number;
    message: string;
    event: "trade_completed";
    progress: number;
    status: "success" | "failed";
  } | null>(null);
  /*
  "trader_id": trader_id,
"trade_id": trade.id,
"ticker": trade.stock.ticker,
"quantity": trade.quantity,
"message": notification.message,
"event": "trade_completed",
"progress": 100,
"status":"success"
  */

  useEffect(() => {
    if (!url) {
      console.warn("WebSocket URL is null or undefined");
      return;
    }
    const socket = new WebSocket(url);
    connection.current = socket;

    socket.onopen = () => {
      console.log("WebSocket connected ✅");
      setStatus((prev) => ({ ...prev, connected: true, error: false }));
    };

    socket.onmessage = (event) => {
      try {
        const parsedMessage = JSON.parse(event.data);
        setMessage(parsedMessage);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
        setMessage(event.data); // Fallback to raw message
      }
    };

    socket.onerror = (event) => {
      console.error("WebSocket error ❌", event);
      setStatus((prev) => ({ ...prev, error: true }));
    };

    socket.onclose = () => {
      console.warn("WebSocket disconnected 🔴");
      setStatus({ connected: false, error: false });
    };

    return () => {
      socket.close();
    };
  }, [url]); // Removed `status` to prevent infinite loops

  return { status, message };
}

export { useWebSocket };
