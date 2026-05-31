import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useUsageChart } from "../hooks/use-dashboard";

const chartConfig = {
  total: {
    label: "Total",
    color: "var(--chart-2)",
  },
  success: {
    label: "Success",
    color: "var(--chart-3)",
  },
  failed: {
    label: "Failed",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

type AnalyticsChartProps = {
  range: string;
  onRangeChange: (range: string) => void;
};

export function AnalyticsChart({ range, onRangeChange }: AnalyticsChartProps) {
  const { data, isLoading } = useUsageChart(range);

  if (isLoading) {
    return (
      <Card className="pt-0">
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1">
            <CardTitle>Usage Trends</CardTitle>
            <CardDescription>Total requests, success, and error rates over time</CardDescription>
          </div>
          <Skeleton className="hidden h-10 w-40 rounded-lg sm:block" />
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <Skeleton className="h-62.5 w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = data?.chartData ?? [];

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Usage Trends</CardTitle>
          <CardDescription>Total requests, success, and error rates over time</CardDescription>
        </div>
        <Select value={range} onValueChange={onRangeChange}>
          <SelectTrigger className="hidden w-40 rounded-lg sm:ml-auto sm:flex" aria-label="Select a value">
            <SelectValue placeholder="Last 14 days" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="30d" className="rounded-lg">
              Last 30 days
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
        {chartData.length === 0 ? (
          <div className="flex h-62.5 items-center justify-center text-sm text-muted-foreground">
            No data for this period
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-62.5 w-full">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="fillSuccess" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillFailed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-failed)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-failed)" stopOpacity={0.1} />
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
              <Area dataKey="total" type="natural" fill="none" stroke="var(--color-total)" strokeWidth={1.5} />
              <Area dataKey="success" type="natural" fill="none" stroke="var(--color-success)" strokeWidth={1.5} />
              <Area dataKey="failed" type="natural" fill="none" stroke="var(--color-failed)" strokeWidth={1.5} />
              <ChartLegend
                content={({ payload }) => (
                  <div className="mt-2 flex justify-center gap-4 text-sm">
                    {[...(payload ?? [])].reverse().map((entry) => (
                      <div
                        key={entry.dataKey as string}
                        className="flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"
                      >
                        <div
                          className="h-2 w-2 shrink-0 rounded-[2px]"
                          style={{
                            background: entry.color,
                          }}
                        />
                        <span className="text-xs">{chartConfig[entry.dataKey as keyof typeof chartConfig]?.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
