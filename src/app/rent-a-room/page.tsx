import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { RoomCard } from "@/components/room-card";

export default async function RentARoomPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const rooms = await prisma.room.findMany({
    where: { status: { not: "ARCHIVED" } },
    include: {
      photos: true,
      interests: user ? { where: { userId: user.id } } : false,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-4xl font-bold text-venturo-olive">Rent a Room</h1>
      <p className="mt-4 max-w-xl text-foreground/80">
        Browse current listings below. Rooms marked unavailable are already
        rented, but you can ask to be notified if one opens back up.
      </p>

      {rooms.length === 0 ? (
        <p className="mt-8 text-foreground/60">No rooms listed right now — check back soon.</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} isLoggedIn={!!user} />
          ))}
        </div>
      )}
    </div>
  );
}
