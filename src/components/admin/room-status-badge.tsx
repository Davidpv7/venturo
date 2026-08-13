import type { RoomStatus } from "@/generated/prisma/client";

export const ROOM_STATUS_LABEL: Record<RoomStatus, string> = {
  AVAILABLE: "AVAILABLE",
  PENDING_DEPOSIT: "PENDING DEPOSIT",
  RENTED: "RENTED",
  ARCHIVED: "ARCHIVED",
};

const badgeClasses: Record<RoomStatus, string> = {
  AVAILABLE: "bg-venturo-olive/10 text-venturo-olive",
  PENDING_DEPOSIT: "bg-red-50 text-red-700",
  RENTED: "bg-foreground/80 text-white",
  ARCHIVED: "bg-foreground/5 text-foreground/40",
};

// Solid hex fills for recharts <Cell>/<Bar> — badge tint classes above are
// translucent Tailwind utilities, not usable as SVG fill colors. Validated
// as a colorblind-safe categorical set via the dataviz skill's palette
// checker; order matters for the adjacency check the validator ran against
// (AVAILABLE, PENDING_DEPOSIT, RENTED, ARCHIVED).
export const ROOM_STATUS_CHART_COLOR: Record<RoomStatus, string> = {
  AVAILABLE: "#1baf7a",
  PENDING_DEPOSIT: "#eb6834",
  RENTED: "#2a78d6",
  ARCHIVED: "#eda100",
};

export function RoomStatusBadge({ status }: { status: RoomStatus }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badgeClasses[status]}`}>
      {ROOM_STATUS_LABEL[status]}
    </span>
  );
}
