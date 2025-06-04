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
  holdings,
}: {
  holdings: UserData["holdings"];
}) {
  const headers = [
    "Symbol",
    "Quantity",
    "Total Value",
    "Purchase Date",
    "Current Price",
    "Current Value",
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
                  ${holding.current_price * holding.quantity}
                </TableCell>
                <TableCell>
                  {new Date(holding.purchase_date).toLocaleDateString()}
                </TableCell>
                <TableCell>${holding.current_price.toFixed(2)}</TableCell>
                <TableCell>${holding.current_value.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
