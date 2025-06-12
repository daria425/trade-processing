import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import TradeProgress from "./TradeProgress";
import { apiConfig } from "../../config/api.config";
import type {
  StockSearchResults,
  StockSearchResult,
} from "../../types/forms.types";

function StockSearchForm({
  onSelectStock,
}: {
  onSelectStock: (symbol: string) => void;
}) {
  const searchFormSchema = z.object({
    symbol: z.string().min(1, "Symbol is required"),
  });
  const searchForm = useForm<z.infer<typeof searchFormSchema>>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      symbol: "",
    },
  });
}
export default function BuyForm({
  cashBalance,
  tradeStatus,
  onTradeComplete,
  getIdToken,
  handleGetPriceData,
  selectedHolding,
}: {
  cashBalance: number;
  tradeStatus: "queued" | "in_progress" | "completed" | "failed" | null;
  onTradeComplete: () => void;
  getIdToken: () => Promise<string>;
  handleGetPriceData: (symbol: string) => Promise<void>;
  selectedHolding: {
    symbol: string;
    quantity: number;
    current_price: number;
    current_value: number;
  } | null;
}) {
  const searchFormSchema = z.object({
    symbol: z.string().min(1, "Symbol is required"),
  });
  const searchForm = useForm<z.infer<typeof searchFormSchema>>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      symbol: "",
    },
  });
  const [searchResults, setSearchResults] = useState<StockSearchResults>([]);

  const onSubmit = async (data: z.infer<typeof searchFormSchema>) => {
    const response = await apiConfig.get(
      `/api/stock/lookup/?symbol=${data.symbol}`
    );
    if (response.status === 200) {
      const yfSearchResultResponse = response.data;

      console.log("search results:", yfSearchResultResponse);
      const searchData = yfSearchResultResponse.search_results;
      setSearchResults(searchData);
    } else {
      console.error("Failed to fetch search results");
    }
  };
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md mx-4 z-10 overflow-hidden">
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 p-4 bg-indigo-600 text-white">
          <h2 className="text-xl font-semibold">Buy Stocks</h2>
          <button type="button" onClick={() => {}}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6 bg-gray-800">
          {tradeStatus ? (
            <TradeProgress
              getIdToken={getIdToken}
              onTradeComplete={onTradeComplete}
            />
          ) : (
            <>
              <Form {...searchForm}>
                <form
                  onSubmit={searchForm.handleSubmit(onSubmit)}
                  className="flex flex-col gap-4"
                >
                  <FormField
                    control={searchForm.control}
                    name="symbol"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-gray-300">
                          Search Stock Symbol
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Enter stock symbol"
                            {...field}
                            className="border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
              {searchResults.length > 0 && (
                <div className="mt-6 bg-gray-900 rounded-md border border-gray-700">
                  <div className="divide-y divide-gray-700">
                    {searchResults.map((stock: StockSearchResult) => (
                      <div
                        key={stock.symbol}
                        className="p-4 hover:bg-gray-800 cursor-pointer flex justify-between items-center"
                        onClick={() => {
                          handleGetPriceData(stock.symbol);
                          // Optionally, you can close the form or perform other actions
                        }}
                      >
                        <div>
                          <div className="font-medium text-white">
                            {stock.symbol}
                          </div>
                          <div className="text-sm text-gray-400">
                            {stock.name}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
