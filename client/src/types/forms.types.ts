export interface FormDataType {
  tradeStatus: "queued" | "in_progress" | "completed" | "failed" | null;
  tradeType: "buy" | "sell";
  cashBalance: number;
  holding: {
    symbol: string;
    quantity: number;
    current_price: number;
    current_value: number;
  } | null;
}

export type StockSearchResult = {
  symbol: string;
  name: string;
};
export type StockSearchResults = StockSearchResult[];
