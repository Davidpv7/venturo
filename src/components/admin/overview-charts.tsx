"use client";

import {
  Bar,
  BarChart,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { RoomStatus } from "@/generated/prisma/client";
import { ROOM_STATUS_CHART_COLOR } from "@/components/admin/room-status-badge";
import { Card } from "@/components/ui/card";

type StatusDatum = { status: RoomStatus; label: string; count: number };
type HomeDatum = {
  homeId: string;
  homeName: string;
  AVAILABLE: number;
  PENDING_DEPOSIT: number;
  RENTED: number;
  ARCHIVED: number;
};

export function OverviewCharts({
  statusData,
  homeData,
}: {
  statusData: StatusDatum[];
  homeData: HomeDatum[];
}) {
  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-2">
      <Card>
        <h3 className="text-sm font-semibold text-foreground">Rooms by status</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={statusData} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
            <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="label" width={110} axisLine={false} tickLine={false} />
            <Tooltip />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {statusData.map((d) => (
                <Cell key={d.status} fill={ROOM_STATUS_CHART_COLOR[d.status]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-foreground">Rooms per home by status</h3>
        {homeData.length === 0 ? (
          <p className="mt-4 text-sm text-foreground/50">No homes yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(180, homeData.length * 56)}>
            <BarChart data={homeData} layout="vertical" margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
              <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="homeName" width={130} axisLine={false} tickLine={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="AVAILABLE" stackId="rooms" name="Available" fill={ROOM_STATUS_CHART_COLOR.AVAILABLE} />
              <Bar
                dataKey="PENDING_DEPOSIT"
                stackId="rooms"
                name="Pending deposit"
                fill={ROOM_STATUS_CHART_COLOR.PENDING_DEPOSIT}
              />
              <Bar dataKey="RENTED" stackId="rooms" name="Rented" fill={ROOM_STATUS_CHART_COLOR.RENTED} />
              <Bar
                dataKey="ARCHIVED"
                stackId="rooms"
                name="Archived"
                radius={[0, 4, 4, 0]}
                fill={ROOM_STATUS_CHART_COLOR.ARCHIVED}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  );
}
