"use client";

import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export type WeekPoint = { week: string; confirmed: number; pending: number; cancelled: number };
export type StatusSlice = { name: string; value: number; color: string };

const TOOLTIP_STYLE = {
  borderRadius: 12,
  border: "1px solid rgba(15,23,42,0.1)",
  fontSize: 12,
  boxShadow: "0 8px 24px rgba(15,23,42,0.12)",
} as const;

/** Bookings received per week (created_at), stacked by current status. */
export function WeeklyTrendChart({ data }: { data: WeekPoint[] }) {
  return (
    <div className="h-64 w-full" role="img" aria-label="Bookings received per week">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -22 }} barCategoryGap="28%">
          <CartesianGrid vertical={false} stroke="rgba(15,23,42,0.06)" />
          <XAxis dataKey="week" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748b" }} width={32} />
          <Tooltip cursor={{ fill: "rgba(15,23,42,0.05)" }} contentStyle={TOOLTIP_STYLE} labelStyle={{ fontWeight: 600 }} />
          <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" iconSize={8} />
          <Bar dataKey="confirmed" name="Confirmed/Completed" stackId="s" fill="#16a34a" radius={[0, 0, 0, 0]} maxBarSize={34} />
          <Bar dataKey="pending" name="Pending" stackId="s" fill="#f59e0b" maxBarSize={34} />
          <Bar dataKey="cancelled" name="Cancelled" stackId="s" fill="#e11d48" radius={[5, 5, 0, 0]} maxBarSize={34} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Share of bookings by current status. */
export function StatusDonut({ data }: { data: StatusSlice[] }) {
  return (
    <div className="h-64 w-full" role="img" aria-label="Bookings by status">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="85%" paddingAngle={3} strokeWidth={0}>
            {data.map((s) => (
              <Cell key={s.name} fill={s.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v, name) => [`${v} booking${v === 1 ? "" : "s"}`, name]} />
          <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" iconSize={8} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
