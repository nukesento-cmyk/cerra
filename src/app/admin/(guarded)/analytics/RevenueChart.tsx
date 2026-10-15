"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type Point = { date: string; usd: number; kes: number };

export function RevenueChart({ data }: { data: Point[] }) {
  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    }),
    usdDollars: d.usd / 100, // cents → dollars for the axis
  }));

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formatted} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            stroke="#71717a"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            stroke="#71717a"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `$${v}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#18181b",
              border: "1px solid rgba(251, 191, 36, 0.2)",
              borderRadius: 6,
              fontSize: 12,
            }}
            labelStyle={{ color: "#a1a1aa" }}
            formatter={(value: number, name: string) => {
              if (name === "usdDollars") return [`$${value.toFixed(2)}`, "USD"];
              return [value, name];
            }}
          />
          <Line
            type="monotone"
            dataKey="usdDollars"
            stroke="#fbbf24"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#fbbf24" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}