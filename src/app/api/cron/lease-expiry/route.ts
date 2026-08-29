import { NextRequest, NextResponse } from "next/server";
import { releaseExpiredPendingLeases } from "@/lib/lease-expiry";

// Same Vercel Cron auth pattern as /api/cron/application-cleanup — see that
// route's comment for why this is a Route Handler rather than a Server
// Action. Runs hourly (see vercel.json) so the 24h lease-sign/deposit
// deadline doesn't drift by much more than an hour past expiresAt.
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const released = await releaseExpiredPendingLeases();
  return NextResponse.json({ released });
}
