export interface WebSocketStatus {
  connected: boolean | null;
  error: boolean | null;
}

export interface InitialResponse {
  status: string;
  message: string;
}
