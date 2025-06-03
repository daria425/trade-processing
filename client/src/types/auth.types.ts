interface Trader {
  id: string;
  trader_id: string; // Firebase UID
  email: string;
  name?: string;
  created_at: string;
  updated_at: string;
  last_seen_at: string;
  notification_tokens: string[];
  is_messaging_enabled: boolean;
  cash_balance: number;
}
interface Holding {
  id: string;
  symbol: string;
  quantity: number;
  price: number;
  purchase_date: string;
  trader_id: string;
}
export interface UserData {
  trader: Trader;
  portfolio_value: number;
  holdings: Holding[];
}

type AuthError = {
  message: string;
};
export interface AuthContextType {
  userData: UserData | null;
  isLoading: boolean;
  error: AuthError | null;
  setError: (error: AuthError | null) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  getIdToken: () => Promise<string>;
}
