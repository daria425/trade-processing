import type { MarketDataPoint } from "../../types/websocket.types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
type ProcessedDataPoint = {
  timestamp: string;
  [ticker: string]: number | string;
};
export default function MarketDataChart({
  chartData,
}: {
  chartData: Array<MarketDataPoint[]>;
}) {
  const processedData: ProcessedDataPoint[] = [];
  if (!chartData || chartData.length === 0) {
    return <div className="text-center p-4">No market data available</div>;
  }

  chartData.forEach((batch) => {
    // Check if batch is an array before using forEach
    if (!Array.isArray(batch) || batch.length === 0) {
      console.warn("Invalid batch received:", batch);
      return; // Skip this iteration
    }

    // Get the timestamp from the first item in the batch
    const timestamp = batch[0].date;
    const formattedTimestamp = new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    // Create a new data point for this timestamp
    const dataPoint: ProcessedDataPoint = { timestamp: formattedTimestamp };

    // Add price for each ticker in this batch
    batch.forEach((item) => {
      if (
        item &&
        typeof item === "object" &&
        "ticker" in item &&
        "price" in item
      ) {
        dataPoint[item.ticker] = item.price;
      }
    });

    processedData.push(dataPoint);
  });

  // Get unique tickers from all data points
  const allTickers = new Set<string>();
  chartData.forEach((batch) => {
    if (Array.isArray(batch)) {
      batch.forEach((item) => {
        if (item && typeof item === "object" && "ticker" in item) {
          allTickers.add(item.ticker);
        }
      });
    }
  });
  const tickerColors = [
    "oklch(78.5% 0.115 274.713)",
    "oklch(58.5% 0.233 277.117)",
    "oklch(87% 0.065 274.039)",
  ];
  const tickers = Array.from(allTickers).slice(0, 5);
  const getColorForTicker = (tickerIndex: number): string => {
    return tickerColors[tickerIndex % tickerColors.length];
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={processedData}
        margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="timestamp" dy={19} />
        <Tooltip />
        <YAxis
          axisLine={false}
          tickFormatter={(val) => `$${val}`}
          tickLine={false}
        />
        {tickers.map((ticker, index) => (
          <Line
            key={ticker}
            type="monotone"
            dataKey={ticker}
            name={ticker}
            stroke={getColorForTicker(index)}
            connectNulls={true}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
