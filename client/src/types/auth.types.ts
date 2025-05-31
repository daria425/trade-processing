interface Trader {
  id: string;
  trader_id: string; // Firebase UID
  email: string;
  name?: string;
  created_at: string;
  updated_at: string;
}
export interface UserData {
  user: Trader;
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
