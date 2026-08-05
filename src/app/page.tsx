import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { RoomCard } from "@/components/room-card";

const features = [
  {
    title: "Fully furnished, bills included",
    body: "Move in with a bag, not a moving truck. Rooms come furnished, and your rent covers utilities.",
  },
  {
    title: "Professionally managed",
    body: "One landlord, one point of contact — no faceless agency, no runaround when something needs fixing.",
  },
  {
    title: "Simple, honest process",
    body: "Browse listings, sign your lease online, sort the deposit — no hidden fees or surprise conditions.",
  },
];

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const featuredRooms = await prisma.room.findMany({
    where: { status: "AVAILABLE" },
    include: { photos: true },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  return (
    <div>
      <section className="mx-auto max-w-5xl px-6 py-20 text-center">
        <h1 className="text-5xl font-bold text-venturo-olive">
          Find your next room with Venturo
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-foreground/70">
          Furnished share-house rooms, managed properly, rented simply.
        </p>
        <Link
          href="/rent-a-room"
          className="mt-8 inline-block rounded bg-venturo-olive px-6 py-3 font-medium text-white"
        >
          Browse available rooms
        </Link>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-16">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title}>
              <h2 className="font-semibold text-venturo-olive">{feature.title}</h2>
              <p className="mt-2 text-sm text-foreground/70">{feature.body}</p>
            </div>
          ))}
        </div>
      </section>

      {featuredRooms.length > 0 && (
        <section className="mx-auto max-w-5xl px-6 pb-20">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-venturo-olive">Available now</h2>
            <Link href="/rent-a-room" className="text-sm text-venturo-olive underline">
              See all rooms
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredRooms.map((room) => (
              <RoomCard key={room.id} room={room} isLoggedIn={!!user} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
