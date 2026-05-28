import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const chartData = [
  { date: "2026-05-01", total: 1250, success: 1180, error: 70 },
  { date: "2026-05-02", total: 1100, success: 1050, error: 50 },
  { date: "2026-05-03", total: 980, success: 940, error: 40 },
  { date: "2026-05-04", total: 1350, success: 1280, error: 70 },
  { date: "2026-05-05", total: 1420, success: 1350, error: 70 },
  { date: "2026-05-06", total: 1180, success: 1120, error: 60 },
  { date: "2026-05-07", total: 1050, success: 1000, error: 50 },
  { date: "2026-05-08", total: 1600, success: 1520, error: 80 },
  { date: "2026-05-09", total: 1480, success: 1410, error: 70 },
  { date: "2026-05-10", total: 1320, success: 1260, error: 60 },
  { date: "2026-05-11", total: 890, success: 850, error: 40 },
  { date: "2026-05-12", total: 1150, success: 1100, error: 50 },
  { date: "2026-05-13", total: 1380, success: 1310, error: 70 },
  { date: "2026-05-14", total: 1550, success: 1470, error: 80 },
  { date: "2026-05-15", total: 1280, success: 1220, error: 60 },
  { date: "2026-05-16", total: 1430, success: 1360, error: 70 },
  { date: "2026-05-17", total: 1210, success: 1150, error: 60 },
  { date: "2026-05-18", total: 990, success: 950, error: 40 },
  { date: "2026-05-19", total: 1360, success: 1290, error: 70 },
  { date: "2026-05-20", total: 1520, success: 1440, error: 80 },
  { date: "2026-05-21", total: 1400, success: 1330, error: 70 },
  { date: "2026-05-22", total: 1180, success: 1120, error: 60 },
  { date: "2026-05-23", total: 1080, success: 1030, error: 50 },
  { date: "2026-05-24", total: 1450, success: 1380, error: 70 },
  { date: "2026-05-25", total: 1670, success: 1580, error: 90 },
  { date: "2026-05-26", total: 1390, success: 1320, error: 70 },
  { date: "2026-05-27", total: 1530, success: 1450, error: 80 },
];

const chartConfig = {
  total: {
    label: "Requests",
    color: "var(--chart-1)",
  },
  success: {
    label: "Success",
    color: "var(--chart-2)",
  },
  error: {
    label: "Error",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

export function AnalyticsChart() {
  const [timeRange, setTimeRange] = React.useState("14d");

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date("2026-05-27");
    let daysToSubtract = 27;
    if (timeRange === "7d") {
      daysToSubtract = 7;
    } else if (timeRange === "14d") {
      daysToSubtract = 14;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Usage Trends</CardTitle>
          <CardDescription>Total requests, success, and error rates over time</CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="hidden w-40 rounded-lg sm:ml-auto sm:flex"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Last 14 days" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="27d" className="rounded-lg">
              Last 27 days
            </SelectItem>
            <SelectItem value="14d" className="rounded-lg">
              Last 14 days
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-62.5 w-full">
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-total)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-total)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillSuccess" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillError" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-error)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-error)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="total"
              type="natural"
              fill="url(#fillTotal)"
              stroke="var(--color-total)"
              stackId="a"
            />
            <Area
              dataKey="success"
              type="natural"
              fill="url(#fillSuccess)"
              stroke="var(--color-success)"
              stackId="a"
            />
            <Area
              dataKey="error"
              type="natural"
              fill="url(#fillError)"
              stroke="var(--color-error)"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
