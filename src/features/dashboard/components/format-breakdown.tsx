import { useCallback, useState } from "react";
import { Bar, BarChart, Rectangle, ResponsiveContainer, Tooltip, XAxis, type BarShapeProps } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useFormatBreakdown } from "../hooks/use-dashboard";

const colors = ["#3b82f6", "#14b8a6", "#f97316", "#ec4899"];
const hoverColors = ["#2563eb", "#0d9488", "#ea580c", "#db2777"];

type FormatBreakdownProps = {
  range: string;
};

export function FormatBreakdown({ range }: FormatBreakdownProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { data, isLoading } = useFormatBreakdown(range);

  const renderBarShape = useCallback(
    (props: BarShapeProps) => {
      const fill = hoveredIndex === props.index ? hoverColors[props.index] : colors[props.index];
      return <Rectangle {...props} fill={fill} />;
    },
    [hoveredIndex]
  );

  if (isLoading) {
    return (
      <Card className="flex h-full flex-col">
        <CardHeader>
          <CardTitle>Format Breakdown</CardTitle>
          <CardDescription>Export output format volume across captured screenshot documents.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="flex h-full items-end gap-4 pb-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={`skeleton-bar-${i}`} className="flex flex-1 flex-col items-center gap-2">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data ?? [];

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Format Breakdown</CardTitle>
        <CardDescription>Export output format volume across captured screenshot documents.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              onMouseLeave={() => setHoveredIndex(null)}
              margin={{ top: 0, right: 16, left: -16, bottom: 0 }}
              barCategoryGap="60%"
            >
              <XAxis
                dataKey="name"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <Tooltip
                cursor={false}
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 shadow-md">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: colors[chartData.findIndex((d) => d.name === label)] }}
                      />
                      <span className="text-sm font-bold">{payload[0].value?.toLocaleString()}</span>
                    </div>
                  );
                }}
              />
              <Bar
                dataKey="count"
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
                className="cursor-pointer"
                shape={renderBarShape}
                onMouseEnter={(_, index) => setHoveredIndex(index)}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
