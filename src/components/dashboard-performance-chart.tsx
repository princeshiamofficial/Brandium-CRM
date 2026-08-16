import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/dashboard";

type TimeRange = "7d" | "30d" | "12m";

const mockTrendData = {
  "7d": [
    { name: "Mon", sales: 12500, prospects: 12 },
    { name: "Tue", sales: 18000, prospects: 19 },
    { name: "Wed", sales: 14200, prospects: 15 },
    { name: "Thu", sales: 24000, prospects: 28 },
    { name: "Fri", sales: 32000, prospects: 35 },
    { name: "Sat", sales: 28500, prospects: 24 },
    { name: "Sun", sales: 19000, prospects: 18 },
  ],
  "30d": [
    { name: "Week 1", sales: 78000, prospects: 85 },
    { name: "Week 2", sales: 94000, prospects: 110 },
    { name: "Week 3", sales: 120000, prospects: 145 },
    { name: "Week 4", sales: 148000, prospects: 168 },
  ],
  "12m": [
    { name: "Jan", sales: 180000, prospects: 210 },
    { name: "Feb", sales: 220000, prospects: 260 },
    { name: "Mar", sales: 195000, prospects: 230 },
    { name: "Apr", sales: 280000, prospects: 310 },
    { name: "May", sales: 340000, prospects: 380 },
    { name: "Jun", sales: 310000, prospects: 340 },
    { name: "Jul", sales: 390000, prospects: 420 },
    { name: "Aug", sales: 450000, prospects: 490 },
    { name: "Sep", sales: 410000, prospects: 440 },
    { name: "Oct", sales: 480000, prospects: 520 },
    { name: "Nov", sales: 520000, prospects: 560 },
    { name: "Dec", sales: 610000, prospects: 640 },
  ],
};

type CustomTooltipProps = {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number;
    color?: string;
  }>;
  label?: string;
};

// Custom Tooltip Formatter
function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white/95 dark:bg-slate-900/95 dark:border-slate-800 p-3 shadow-lg backdrop-blur text-xs space-y-1.5 min-w-36">
        <p className="font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-1">
          {label}
        </p>
        <div className="flex items-center justify-between gap-4 text-emerald-600 dark:text-emerald-400 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-500" />
            Revenue:
          </span>
          <span className="font-mono font-bold">{formatCurrency(payload[0]?.value ?? 0)}</span>
        </div>
        {payload[1] && (
          <div className="flex items-center justify-between gap-4 text-blue-600 dark:text-blue-400 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-blue-600" />
              Prospects:
            </span>
            <span className="font-mono font-bold">{payload[1].value}</span>
          </div>
        )}
      </div>
    );
  }
  return null;
}

export function DashboardPerformanceChart() {
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const data = mockTrendData[timeRange];

  return (
    <Card className="rounded-xl border border-slate-200/80 dark:border-border bg-card text-card-foreground shadow-xs overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <div>
          <CardTitle className="text-base font-semibold tracking-tight text-foreground flex items-center gap-2">
            Performance Overview
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            Sales revenue and prospect acquisition trend over time
          </CardDescription>
        </div>

        {/* Time Filter Pills */}
        <div className="flex items-center gap-1 bg-muted/60 dark:bg-muted p-1 rounded-lg">
          {(
            [
              { id: "7d", label: "7 Days" },
              { id: "30d", label: "30 Days" },
              { id: "12m", label: "1 Year" },
            ] as const
          ).map((range) => (
            <button
              key={range.id}
              onClick={() => setTimeRange(range.id)}
              className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                timeRange === range.id
                  ? "bg-white dark:bg-card text-primary shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="h-70 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7AC142" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#7AC142" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="prospectsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0A2E5C" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0A2E5C" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E1E6ED" />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="text-xs fill-muted-foreground"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="text-xs fill-muted-foreground"
                tickFormatter={(val) => (val >= 1000 ? `${val / 1000}k` : val)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: "12px", fontSize: "12px" }}
              />

              <Area
                type="monotone"
                dataKey="sales"
                name="Revenue (৳)"
                stroke="#7AC142"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#salesGradient)"
              />
              <Area
                type="monotone"
                dataKey="prospects"
                name="Prospects"
                stroke="#0A2E5C"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#prospectsGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
