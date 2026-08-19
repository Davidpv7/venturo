import Image from "next/image";
import type { Interest, Photo, Room } from "@/generated/prisma/client";
import { formatWeeklyPrice } from "@/lib/format";
import { createInterest } from "@/app/actions";
import { Button, ButtonLink } from "@/components/ui/button";

type RoomWithPhotos = Room & { photos: Photo[]; interests?: Interest[] };

export function RoomCard({
  room,
  homeId,
  isLoggedIn,
}: {
  room: RoomWithPhotos;
  homeId: string;
  isLoggedIn: boolean;
}) {
  const primaryPhoto = room.photos.find((p) => p.order === 0) ?? room.photos[0];
  const isAvailable = room.status === "AVAILABLE";
  const hasInterest = (room.interests?.length ?? 0) > 0;

  return (
    <div className="group overflow-hidden rounded-xl border border-venturo-olive/15 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-video overflow-hidden bg-venturo-cream-alt">
        {primaryPhoto ? (
          <Image
            src={primaryPhoto.url}
            alt={room.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-foreground/40">
            No photo yet
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-foreground">{room.title}</h3>
          {!isAvailable && (
            <span className="shrink-0 rounded-full bg-foreground/10 px-2 py-0.5 text-xs font-medium text-foreground/60">
              Unavailable
            </span>
          )}
        </div>
        <p className="text-sm text-foreground/80 line-clamp-2">{room.subtitle ?? room.description}</p>
        <div className="mt-1 flex items-center justify-between text-sm">
          <span className="font-medium text-venturo-olive">
            {formatWeeklyPrice(room.price)}
          </span>
          <span className="text-foreground/60">
            {room.leaseLengthMonths} month lease
          </span>
        </div>

        {isAvailable ? (
          <ButtonLink href={`/rent-a-room/${homeId}/${room.id}`} className="mt-3">
            See more info
          </ButtonLink>
        ) : hasInterest ? (
          <p className="mt-3 rounded-md border border-venturo-olive/30 px-4 py-2.5 text-center text-sm text-foreground/60">
            You&apos;re on the notify list ✓
          </p>
        ) : isLoggedIn ? (
          <form action={createInterest} className="mt-3">
            <input type="hidden" name="roomId" value={room.id} />
            <Button type="submit" variant="secondary" className="w-full">
              Notify me when available
            </Button>
          </form>
        ) : (
          <ButtonLink href="/login" variant="secondary" className="mt-3">
            Log in to get notified
          </ButtonLink>
        )}
      </div>
    </div>
  );
}
