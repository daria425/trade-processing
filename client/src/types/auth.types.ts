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
export interface Holding {
  id: string;
  symbol: string;
  quantity: number;
  total_value: number;
  purchase_date: string;
  trader_id: string;
  current_price: number;
  current_value: number;
}

/*

{
    "message": "Trader logged in successfully",
    "trader": {
        "id": "fusvH9xzOncbwYY3rsdYOmoztet1",
        "trader_id": "fusvH9xzOncbwYY3rsdYOmoztet1",
        "email": "darianaumova5@gmail.com",
        "name": "daria2",
        "status": "online",
        "created_at": "2025-06-01T09:06:07.776841+00:00",
        "updated_at": "2025-06-03T20:44:09.601520+00:00",
        "last_seen_at": "2025-06-02T21:16:04.717822+00:00",
        "is_messaging_enabled": true,
        "cash_balance": 97990,
        "notification_tokens": [
            "d7botpGxHKnUWZ-8ugs9pO:APA91bFhr1PIKK43ZAUDvF39Emksy-vP-92qm1EOdY0TysPHD21p6RIjcABW2UlmnO8DcC0VMCDpARhC7TZgmw4NfqddXBQoo59ehLTakYnm3Thizpi8BlA"
        ]
    },
    "holdings": [
        {
            "id": "6052ab7d-22ed-4d97-a33c-f43da09bfdd6",
            "symbol": "AAPL",
            "quantity": 10,
            "price": 201,
            "purchase_date": "2025-06-03T20:44:09.601520+00:00",
            "current_price": 203.02999877929688,
            "current_value": 2030.2999877929688
        }
    ],
    "portfolio_value": 2030.2999877929688
}
*/
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
