import type { MarketDataPoint } from "../../types/websocket.types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
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
  chartData.forEach((batch, batchIndex) => {
    // Get the timestamp from the first item in the batch
    const timestamp = batch[0]?.date || `Batch ${batchIndex}`;

    // Create a new data point for this timestamp
    const dataPoint: ProcessedDataPoint = { timestamp };

    // Add price for each ticker in this batch
    batch.forEach((item) => {
      dataPoint[item.ticker] = item.price;
    });

    processedData.push(dataPoint);
  });

  // Get unique tickers from all data points
  const allTickers = new Set<string>();
  chartData.forEach((batch) => {
    batch.forEach((item) => {
      allTickers.add(item.ticker);
    });
  });
  const tickerColors: Record<string, string> = {
    AAPL: "#ff6b6b",
    GOOGL: "#48dbfb",
    AMZN: "#feca57",
    MSFT: "#1dd1a1",
    TSLA: "#ff9ff3",
  };
  const tickers = Array.from(allTickers);
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={processedData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="timestamp" />
        <YAxis />
        <Tooltip />
        <Legend />
        {tickers.map((ticker) => (
          <Line
            key={ticker}
            type="monotone"
            dataKey={ticker}
            name={ticker}
            stroke={tickerColors[ticker] || "#8884d8"}
            activeDot={{ r: 6 }}
            connectNulls={true}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
