import { useState } from "react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const data = [
  { name: "PNG", count: 1824 },
  { name: "WebP", count: 1532 },
  { name: "JPEG", count: 412 },
  { name: "PDF", count: 84 },
];

const colors = ["#3b82f6", "#14b8a6", "#f97316", "#ec4899"];
const hoverColors = ["#2563eb", "#0d9488", "#ea580c", "#db2777"];

export function FormatBreakdown() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Format Breakdown</CardTitle>
        <CardDescription>Export output format volume across captured screenshot documents.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
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
                  <div className="rounded-lg border bg-background px-3 py-2 shadow-md flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: colors[data.findIndex((d) => d.name === label)] }}
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
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={hoveredIndex === index ? hoverColors[index] : colors[index]}
                  onMouseEnter={() => setHoveredIndex(index)}
                  className="transition-all duration-200"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
