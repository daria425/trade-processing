import { Button } from "@/components/ui/button";
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

export default function TradeForm({
  tradeType,
  cashBalance,
  holding,
  handleCloseTradeForm,
  handleSubmitTrade,
  getIdToken,
  tradeStatus,
}: {
  tradeStatus: "pending" | "completed" | "failed" | null;
  tradeType: string;
  cashBalance: number;
  holding: {
    symbol: string;
    quantity: number;
    current_price: number;
    current_value: number;
  };
  getIdToken: () => Promise<string>;
  handleCloseTradeForm: () => void;
  handleSubmitTrade: (data: {
    quantity: number;
    symbol: string;
    price: number;
  }) => void;
}) {
  const [activeTrade, setActiveTrade] = useState<boolean>(false);
  const createBuyFormSchema = () => {
    return z
      .object({
        quantity: z.coerce.number().positive(),
      })
      .refine((data) => holding.current_price * data.quantity <= cashBalance, {
        message: "Insufficient funds for this purchase",
        path: ["quantity"],
      });
  };

  const createSellFormSchema = () => {
    return z.object({
      quantity: z.coerce
        .number()
        .positive()
        .max(holding.quantity, "Cannot sell more than you own"),
    });
  };
  const buyFormSchema = createBuyFormSchema();
  const sellFormSchema = createSellFormSchema();
  const buyForm = useForm<z.infer<typeof buyFormSchema>>({
    resolver: zodResolver(buyFormSchema),
    defaultValues: {
      quantity: 1,
    },
  });
  const sellForm = useForm<z.infer<typeof sellFormSchema>>({
    resolver: zodResolver(sellFormSchema),
    defaultValues: {
      quantity: 1,
    },
  });
  const form = tradeType === "buy" ? buyForm : sellForm;
  const onSubmit = (
    data: z.infer<typeof buyFormSchema> | z.infer<typeof sellFormSchema>
  ) => {
    console.log(
      `Submitting ${tradeType} trade for ${data.quantity} shares of ${holding.symbol} at $${holding.current_price} each.`
    );

    handleSubmitTrade({
      quantity: data.quantity,
      symbol: holding.symbol,
      price: holding.current_price,
    });
    setActiveTrade(true);
  };
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Backdrop overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleCloseTradeForm}
      ></div>

      {/* Modal content */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md mx-4 z-10 overflow-hidden">
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 p-4 bg-indigo-600 text-white">
          <h2 className="text-xl font-semibold">
            {tradeType === "buy" ? "Buy" : "Sell"} {holding.symbol}
          </h2>
          <button type="button" onClick={handleCloseTradeForm}>
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
          {tradeStatus && tradeStatus === "pending" ? (
            <TradeProgress getIdToken={getIdToken} />
          ) : (
            <>
              <div className="flex justify-between mb-6 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">
                    Current Price
                  </p>
                  <p className="font-medium">
                    ${holding.current_price.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">
                    Available Balance
                  </p>
                  <p className="font-medium">${cashBalance.toFixed(2)}</p>
                </div>
                {tradeType === "sell" && (
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">
                      Shares Owned
                    </p>
                    <p className="font-medium">{holding.quantity}</p>
                  </div>
                )}
              </div>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="flex flex-col gap-4"
                >
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-gray-300">
                          Quantity
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter quantity"
                            {...field}
                            className="border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Order Summary
                    </p>
                    <div className="flex justify-between text-sm my-1">
                      <span className="text-gray-500">Total Cost</span>
                      <span>
                        $
                        {(
                          form.watch("quantity") * holding.current_price
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className={`mt-4 w-full ${
                      tradeType === "buy"
                        ? "bg-indigo-600 hover:bg-indigo-700"
                        : "bg-red-600 hover:bg-red-700"
                    } text-white py-2 rounded-md transition-colors`}
                  >
                    Place{" "}
                    {tradeType.charAt(0).toUpperCase() + tradeType.slice(1)}{" "}
                    Order
                  </Button>
                </form>
              </Form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
