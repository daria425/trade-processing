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
import TradeProgress from "./TradeProgress";

export default function BuyForm({
  cashBalance,
  tradeStatus,
  onTradeComplete,
  getIdToken,
  selectedHolding,
}: {
  cashBalance: number;
  tradeStatus: "queued" | "in_progress" | "completed" | "failed" | null;
  onTradeComplete: () => void;
  getIdToken: () => Promise<string>;
}) {
  const buyFormSchema = z.object({
    quantity: z.coerce
      .number()
      .positive()
      .refine(
        (val) => val * (selectedHolding?.current_price || 0) <= cashBalance,
        {
          message: "Insufficient funds for this purchase",
        }
      ),
    symbol: z.string().min(1, "Symbol is required"),
  });
  const form = useForm<z.infer<typeof buyFormSchema>>({
    resolver: zodResolver(buyFormSchema),
    defaultValues: {
      quantity: 1,
      symbol: "",
    },
  });
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
            <Form {...form}>
              <form onSubmit={() => {}} className="flex flex-col gap-4">
                <FormField
                  control={form.control}
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
          )}
        </div>
      </div>
    </div>
  );
}
