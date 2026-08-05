import { prisma } from "@/lib/prisma";
import { formatWeeklyPrice } from "@/lib/format";
import { requireAdmin } from "@/lib/require-admin";
import { confirmDeposit, releaseRoom, archiveRoom, markRoomAvailable } from "./actions";

const DEPOSIT_WINDOW_HOURS = 12;

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
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-4xl font-bold text-venturo-olive">Admin Dashboard</h1>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-venturo-olive">Rooms</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-venturo-olive/20 text-foreground/60">
                <th className="py-2 pr-4">Title</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Price</th>
                <th className="py-2 pr-4">Actions</th>
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
                  <tr key={room.id} className="border-b border-venturo-olive/10 align-top">
                    <td className="py-3 pr-4">{room.title}</td>
                    <td className="py-3 pr-4">
                      {room.status}
                      {deadline && (
                        <div className="text-xs text-foreground/50">
                          deposit due {deadline.toLocaleString("en-AU")}
                        </div>
                      )}
                      {room.interests.length > 0 && (
                        <div className="text-xs text-foreground/50">
                          {room.interests.length} waiting to be notified
                        </div>
                      )}
                    </td>
                    <td className="py-3 pr-4">{formatWeeklyPrice(room.price)}</td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-wrap gap-2">
                        {room.status === "PENDING_DEPOSIT" && (
                          <>
                            <form action={confirmDeposit}>
                              <input type="hidden" name="roomId" value={room.id} />
                              <button className="rounded bg-venturo-olive px-3 py-1 text-xs font-medium text-white">
                                Confirm Deposit
                              </button>
                            </form>
                            <form action={releaseRoom}>
                              <input type="hidden" name="roomId" value={room.id} />
                              <button className="rounded border border-venturo-olive/30 px-3 py-1 text-xs font-medium">
                                Release Room
                              </button>
                            </form>
                          </>
                        )}
                        {room.status === "RENTED" && (
                          <form action={markRoomAvailable}>
                            <input type="hidden" name="roomId" value={room.id} />
                            <button className="rounded bg-venturo-olive px-3 py-1 text-xs font-medium text-white">
                              Mark Available (Vacated)
                            </button>
                          </form>
                        )}
                        {(room.status === "AVAILABLE" || room.status === "RENTED") && (
                          <form action={archiveRoom}>
                            <input type="hidden" name="roomId" value={room.id} />
                            <button className="rounded border border-venturo-olive/30 px-3 py-1 text-xs font-medium">
                              Archive
                            </button>
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
        <h2 className="text-xl font-semibold text-venturo-olive">Users</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-venturo-olive/20 text-foreground/60">
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Role</th>
                <th className="py-2 pr-4">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-venturo-olive/10">
                  <td className="py-2 pr-4">{user.email}</td>
                  <td className="py-2 pr-4">{user.name ?? "—"}</td>
                  <td className="py-2 pr-4">{user.role}</td>
                  <td className="py-2 pr-4">{user.createdAt.toLocaleDateString("en-AU")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
