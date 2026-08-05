import { prisma } from "@/lib/prisma";
import { formatWeeklyPrice } from "@/lib/format";
import { requireAdmin } from "@/lib/require-admin";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { confirmDeposit, releaseRoom, archiveRoom, markRoomAvailable } from "./actions";
import type { RoomStatus } from "@/generated/prisma/client";

const DEPOSIT_WINDOW_HOURS = 12;

const statusBadge: Record<RoomStatus, string> = {
  AVAILABLE: "bg-venturo-olive/10 text-venturo-olive",
  PENDING_DEPOSIT: "bg-red-50 text-red-700",
  RENTED: "bg-foreground/80 text-white",
  ARCHIVED: "bg-foreground/5 text-foreground/40",
};

export default async function AdminPage() {
  await requireAdmin();

  const [rooms, users] = await Promise.all([
    prisma.room.findMany({
      include: { interests: { where: { notifiedAt: null } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <Container size="lg" className="py-16 sm:py-20">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Admin Dashboard
      </h1>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-foreground">Rooms</h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-venturo-olive/15 bg-white shadow-sm">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-venturo-olive/15 text-foreground/50">
                <th className="px-5 py-3 font-medium">Title</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Price</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => {
                const deadline = room.pendingSince
                  ? new Date(
                      room.pendingSince.getTime() + DEPOSIT_WINDOW_HOURS * 60 * 60 * 1000,
                    )
                  : null;

                return (
                  <tr key={room.id} className="border-b border-venturo-olive/10 align-top last:border-b-0">
                    <td className="px-5 py-4 font-medium text-foreground">{room.title}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusBadge[room.status]}`}
                      >
                        {room.status.replace("_", " ")}
                      </span>
                      {deadline && (
                        <div className="mt-1.5 text-xs text-foreground/50">
                          deposit due {deadline.toLocaleString("en-AU")}
                        </div>
                      )}
                      {room.interests.length > 0 && (
                        <div className="mt-1 text-xs text-foreground/50">
                          {room.interests.length} waiting to be notified
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-foreground/80">
                      {formatWeeklyPrice(room.price)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        {room.status === "PENDING_DEPOSIT" && (
                          <>
                            <form action={confirmDeposit}>
                              <input type="hidden" name="roomId" value={room.id} />
                              <Button type="submit" size="sm">
                                Confirm Deposit
                              </Button>
                            </form>
                            <form action={releaseRoom}>
                              <input type="hidden" name="roomId" value={room.id} />
                              <Button type="submit" variant="secondary" size="sm">
                                Release Room
                              </Button>
                            </form>
                          </>
                        )}
                        {room.status === "RENTED" && (
                          <form action={markRoomAvailable}>
                            <input type="hidden" name="roomId" value={room.id} />
                            <Button type="submit" size="sm">
                              Mark Available
                            </Button>
                          </form>
                        )}
                        {(room.status === "AVAILABLE" || room.status === "RENTED") && (
                          <form action={archiveRoom}>
                            <input type="hidden" name="roomId" value={room.id} />
                            <Button type="submit" variant="secondary" size="sm">
                              Archive
                            </Button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-foreground">Users</h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-venturo-olive/15 bg-white shadow-sm">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-venturo-olive/15 text-foreground/50">
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-venturo-olive/10 last:border-b-0">
                  <td className="px-5 py-3 text-foreground">{user.email}</td>
                  <td className="px-5 py-3 text-foreground/70">{user.name ?? "—"}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        user.role === "ADMIN"
                          ? "bg-venturo-olive/10 text-venturo-olive"
                          : "bg-foreground/5 text-foreground/50"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-foreground/70">
                    {user.createdAt.toLocaleDateString("en-AU")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </Container>
  );
}
