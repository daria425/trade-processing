export interface WebSocketStatus {
  connected: boolean | null;
  error: boolean | null;
}

export interface InitialResponse {
  status: string;
  message: string;
}

export interface MarketDataPoint {
  ticker: string;
  price: number;
  date: string;
}
