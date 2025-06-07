import axios from "axios";

let baseUrl = "http://127.0.0.1:8000";
let marketDataWebsocketUrl = `ws://127.0.0.1:8000/market-data/ws`;
let tradeProgressWebsocketUrl = `ws://127.0.0.1:8000/trade-progress/ws`;
if (import.meta.env.MODE === "production") {
  baseUrl = import.meta.env.VITE_API_URL;
  marketDataWebsocketUrl = `wss://${baseUrl.replace(
    "https://",
    ""
  )}/market-data/ws`;
  tradeProgressWebsocketUrl = `wss://${baseUrl.replace(
    "https://",
    ""
  )}/trade-progress/ws`;
}

const apiConfig = axios.create({
  baseURL: baseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

export { apiConfig, marketDataWebsocketUrl, tradeProgressWebsocketUrl };
