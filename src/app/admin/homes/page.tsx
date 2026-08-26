import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatWeeklyPrice } from "@/lib/format";
import { requireAdmin } from "@/lib/require-admin";
import { Button, ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { EditIconLink } from "@/components/ui/icon-action";
import { DeleteIconForm } from "@/components/admin/delete-icon-form";
import { ConfirmForm } from "@/components/admin/confirm-form";
import { RoomStatusBadge } from "@/components/admin/room-status-badge";
import { confirmDeposit, releaseRoom, archiveRoom, unarchiveRoom, markRoomAvailable } from "./actions";
import { deleteHome, restoreHome, permanentlyDeleteHome } from "./[homeId]/actions";
import { deleteRoom, restoreRoom, permanentlyDeleteRoom } from "./[homeId]/rooms/[roomId]/actions";

const DEPOSIT_WINDOW_HOURS = 12;

const deleteErrors: Record<string, string> = {
  "has-rooms": "Can't delete a home that still has rooms — delete its rooms first.",
  "has-history":
    "Can't permanently delete a room with lease history — restore it or leave it archived/in Trash to keep that record.",
  "active-lease":
    "This room has an active lease — terminate it from Tenants before archiving or deleting it.",
};

export default async function AdminHomesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const { error } = await searchParams;

  const [homes, trashedHomes, trashedRooms] = await Promise.all([
    prisma.home.findMany({
      where: { deletedAt: null },
      include: {
        rooms: {
          where: { deletedAt: null },
          include: { interests: { where: { notifiedAt: null } } },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.home.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: "desc" },
    }),
    prisma.room.findMany({
      where: { deletedAt: { not: null } },
      include: { home: true },
      orderBy: { deletedAt: "desc" },
    }),
  ]);

  return (
    <Container size="lg" className="py-16 sm:py-20">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Homes &amp; Rooms
        </h1>
        <ButtonLink href="/admin/homes/new" size="sm">
          Add Home
        </ButtonLink>
      </div>

      {error && deleteErrors[error] && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2.5 text-sm text-red-700">
          {deleteErrors[error]}
        </p>
      )}

      {homes.map((home) => (
        <div key={home.id} className="mt-8 first:mt-6">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-medium text-foreground">
              <Link href={`/admin/homes/${home.id}`} className="hover:text-venturo-olive">
                {home.name}
              </Link>{" "}
              <span className="font-normal text-foreground/50">— {home.address}</span>
            </h3>
            <div className="flex shrink-0 items-center gap-1">
              <EditIconLink href={`/admin/homes/${home.id}`} label={`Edit ${home.name}`} />
              <DeleteIconForm
                action={deleteHome}
                label={`Delete ${home.name}`}
                confirmMessage={`Delete "${home.name}"? You can restore it from Trash below.`}
              >
                <input type="hidden" name="homeId" value={home.id} />
                <input type="hidden" name="redirectTo" value="/admin/homes" />
              </DeleteIconForm>
            </div>
          </div>
          <div className="mt-2 overflow-x-auto rounded-xl border border-venturo-olive/15 bg-white shadow-sm">
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
                {home.rooms.map((room) => {
                  const deadline = room.pendingSince
                    ? new Date(
                        room.pendingSince.getTime() + DEPOSIT_WINDOW_HOURS * 60 * 60 * 1000,
                      )
                    : null;

                  return (
                    <tr key={room.id} className="border-b border-venturo-olive/10 align-top last:border-b-0">
                      <td className="px-5 py-4 font-medium text-foreground">
                        <Link
                          href={`/admin/homes/${home.id}/rooms/${room.id}`}
                          className="hover:text-venturo-olive"
                        >
                          {room.title}
                        </Link>
                      </td>
                      <td className="px-5 py-4">
                        <RoomStatusBadge status={room.status} />
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
                          {room.status === "ARCHIVED" && (
                            <form action={unarchiveRoom}>
                              <input type="hidden" name="roomId" value={room.id} />
                              <Button type="submit" size="sm">
                                Unarchive
                              </Button>
                            </form>
                          )}
                          <EditIconLink
                            href={`/admin/homes/${home.id}/rooms/${room.id}`}
                            label={`Edit ${room.title}`}
                          />
                          <DeleteIconForm
                            action={deleteRoom}
                            label={`Delete ${room.title}`}
                            confirmMessage={`Delete "${room.title}"? You can restore it from Trash below.`}
                          >
                            <input type="hidden" name="roomId" value={room.id} />
                            <input type="hidden" name="homeId" value={home.id} />
                            <input type="hidden" name="redirectTo" value="/admin/homes" />
                          </DeleteIconForm>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {(trashedHomes.length > 0 || trashedRooms.length > 0) && (
        <section className="mt-12 border-t border-venturo-olive/15 pt-8">
          <h2 className="text-lg font-semibold text-foreground">Trash</h2>
          <p className="mt-1 text-sm text-foreground/60">
            Deleted homes and rooms stay here until restored, or deleted permanently.
          </p>

          {trashedHomes.length > 0 && (
            <div className="mt-4 overflow-x-auto rounded-xl border border-venturo-olive/15 bg-white shadow-sm">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-venturo-olive/15 text-foreground/50">
                    <th className="px-5 py-3 font-medium">Home</th>
                    <th className="px-5 py-3 font-medium">Deleted</th>
                    <th className="px-5 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {trashedHomes.map((home) => (
                    <tr key={home.id} className="border-b border-venturo-olive/10 last:border-b-0">
                      <td className="px-5 py-3 font-medium text-foreground">
                        {home.name}
                        <div className="font-normal text-foreground/50">{home.address}</div>
                      </td>
                      <td className="px-5 py-3 text-foreground/60">
                        {home.deletedAt?.toLocaleString("en-AU")}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap gap-2">
                          <form action={restoreHome}>
                            <input type="hidden" name="homeId" value={home.id} />
                            <Button type="submit" size="sm">
                              Restore
                            </Button>
                          </form>
                          <ConfirmForm
                            action={permanentlyDeleteHome}
                            confirmMessage={`Permanently delete "${home.name}"? This cannot be undone.`}
                          >
                            <input type="hidden" name="homeId" value={home.id} />
                            <Button type="submit" variant="danger" size="sm">
                              Delete Permanently
                            </Button>
                          </ConfirmForm>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {trashedRooms.length > 0 && (
            <div className="mt-4 overflow-x-auto rounded-xl border border-venturo-olive/15 bg-white shadow-sm">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-venturo-olive/15 text-foreground/50">
                    <th className="px-5 py-3 font-medium">Room</th>
                    <th className="px-5 py-3 font-medium">Home</th>
                    <th className="px-5 py-3 font-medium">Deleted</th>
                    <th className="px-5 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {trashedRooms.map((room) => (
                    <tr key={room.id} className="border-b border-venturo-olive/10 last:border-b-0">
                      <td className="px-5 py-3 font-medium text-foreground">{room.title}</td>
                      <td className="px-5 py-3 text-foreground/70">
                        {room.home.name}
                        {room.home.deletedAt && (
                          <span className="ml-1.5 text-xs text-foreground/40">
                            (home also in trash)
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-foreground/60">
                        {room.deletedAt?.toLocaleString("en-AU")}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap gap-2">
                          <form action={restoreRoom}>
                            <input type="hidden" name="roomId" value={room.id} />
                            <Button type="submit" size="sm">
                              Restore
                            </Button>
                          </form>
                          <ConfirmForm
                            action={permanentlyDeleteRoom}
                            confirmMessage={`Permanently delete "${room.title}"? This cannot be undone.`}
                          >
                            <input type="hidden" name="roomId" value={room.id} />
                            <Button type="submit" variant="danger" size="sm">
                              Delete Permanently
                            </Button>
                          </ConfirmForm>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </Container>
  );
}
