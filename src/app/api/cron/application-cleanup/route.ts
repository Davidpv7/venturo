import { NextRequest, NextResponse } from "next/server";
import { cleanupRejectedApplications } from "@/lib/application-cleanup";

// Vercel Cron (see vercel.json) attaches Authorization: Bearer $CRON_SECRET
// automatically when CRON_SECRET is set as a project env var. This is the
// one deliberate exception to "Server Actions are the only write path" (see
// AGENTS.md/CLAUDE.md) — a cron trigger has no way to invoke a Server
// Action directly, so a Route Handler is the minimal-footprint fit here.
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deleted = await cleanupRejectedApplications();
  return NextResponse.json({ deleted });
}
