import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { RoomCard } from "@/components/room-card";
import { Container } from "@/components/ui/container";

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
    <Container className="py-16 sm:py-20">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Rent a Room
      </h1>
      <p className="mt-3 max-w-xl text-foreground/70">
        Browse current listings below. Rooms marked unavailable are already
        rented, but you can ask to be notified if one opens back up.
      </p>

      {rooms.length === 0 ? (
        <p className="mt-10 text-foreground/60">
          No rooms listed right now — check back soon.
        </p>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} isLoggedIn={!!user} />
          ))}
        </div>
      )}
    </Container>
  );
}
