"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export type DayPoint = { day: string; bookings: number };

/** Last-30-days booking activity, one bar per day. */
export function BookingsChart({ data }: { data: DayPoint[] }) {
  return (
    <div className="h-56 w-full" role="img" aria-label="Bookings per day, last 30 days">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -22 }} barCategoryGap="30%">
          <CartesianGrid vertical={false} stroke="rgba(15,23,42,0.06)" />
          <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748b" }} interval={4} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748b" }} width={32} />
          <Tooltip
            cursor={{ fill: "rgba(15,23,42,0.05)" }}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid rgba(15,23,42,0.1)",
              fontSize: 12,
              boxShadow: "0 8px 24px rgba(15,23,42,0.12)",
            }}
            formatter={(v) => [`${v} booking${v === 1 ? "" : "s"}`, ""]}
            labelStyle={{ fontWeight: 600 }}
          />
          <Bar dataKey="bookings" fill="#6366f1" radius={[5, 5, 0, 0]} maxBarSize={26} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
