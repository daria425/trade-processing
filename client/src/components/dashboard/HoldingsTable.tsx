import type { UserData } from "../../types/auth.types";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function HoldingsTable({
  cashBalance,
  holdings,
  handleOpenTradeForm,
}: {
  cashBalance: UserData["trader"]["cash_balance"];
  holdings: UserData["holdings"];
  handleOpenTradeForm: (
    tradeType: "buy" | "sell",
    cashBalance: UserData["trader"]["cash_balance"],
    holding: UserData["holdings"][number]
  ) => void;
}) {
  const headers = [
    "Symbol",
    "Quantity",
    "Purchase Date",
    "Current Price",
    "Current Value",
    "Actions",
  ];
  return (
    <Card className="bg-slate-900 text-white border-1 border-slate-800">
      <CardHeader>Your Holdings</CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="text-white">
              {headers.map((header) => (
                <TableHead key={header} className="font-semibold text-white">
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {holdings.map((holding) => (
              <TableRow key={holding.id}>
                <TableCell>{holding.symbol}</TableCell>
                <TableCell>{holding.quantity}</TableCell>
                <TableCell>
                  {new Date(holding.purchase_date).toLocaleDateString()}
                </TableCell>
                <TableCell>${holding.current_price.toFixed(2)}</TableCell>
                <TableCell>${holding.current_value.toFixed(2)}</TableCell>
                <TableCell className="flex gap-2">
                  <button
                    onClick={() =>
                      handleOpenTradeForm("buy", cashBalance, holding)
                    }
                    type="button"
                    className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
                  >
                    Buy
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleOpenTradeForm("sell", cashBalance, holding)
                    }
                    className="mt-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md"
                  >
                    Sell
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
