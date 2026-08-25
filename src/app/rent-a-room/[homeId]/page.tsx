import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { Container } from "@/components/ui/container";
import { RoomPhotoGallery } from "@/components/room-photo-gallery";
import { RoomCard } from "@/components/room-card";
import { LocationMap } from "@/components/location-map";
import { DescriptionMarkdown } from "@/components/ui/description-markdown";

export default async function HomeDetailPage({
  params,
}: {
  params: Promise<{ homeId: string }>;
}) {
  const { homeId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const home = await prisma.home.findFirst({
    where: { id: homeId, deletedAt: null },
    include: {
      photos: true,
      rooms: {
        where: { status: { not: "ARCHIVED" }, deletedAt: null },
        include: {
          photos: true,
          interests: user ? { where: { userId: user.id } } : false,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!home) notFound();

  return (
    <Container className="py-16 sm:py-20">
      <Link
        href="/rent-a-room"
        className="text-sm text-foreground/60 hover:text-venturo-olive"
      >
        ← Back to all homes
      </Link>

      <div className="mt-4">
        <RoomPhotoGallery photos={home.photos} title={home.name} />
      </div>

      <div className="mt-8 max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {home.name}
        </h1>
        <p className="mt-2 text-foreground/60">{home.address}</p>
        <DescriptionMarkdown
          text={home.description}
          className="mt-4 leading-relaxed text-foreground/80"
        />
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-semibold text-foreground">Rooms in this home</h2>
        {home.rooms.length === 0 ? (
          <p className="mt-4 text-foreground/60">
            No rooms listed here right now — check back soon.
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {home.rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                homeId={home.id}
                isLoggedIn={!!user}
              />
            ))}
          </div>
        )}
      </div>

      <div className="mt-12 max-w-2xl border-t border-venturo-olive/15 pt-10">
        <h2 className="text-xl font-semibold text-foreground">Location</h2>
        <p className="mt-2 text-foreground/60">{home.address}</p>
        <div className="mt-4">
          <LocationMap address={home.address} />
        </div>
      </div>
    </Container>
  );
}
