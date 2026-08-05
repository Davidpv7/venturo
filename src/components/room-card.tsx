import Link from "next/link";
import type { Interest, Photo, Room } from "@/generated/prisma/client";
import { formatWeeklyPrice } from "@/lib/format";
import { createInterest } from "@/app/actions";

type RoomWithPhotos = Room & { photos: Photo[]; interests?: Interest[] };

export function RoomCard({
  room,
  isLoggedIn,
}: {
  room: RoomWithPhotos;
  isLoggedIn: boolean;
}) {
  const primaryPhoto = room.photos.find((p) => p.order === 0) ?? room.photos[0];
  const isAvailable = room.status === "AVAILABLE";
  const hasInterest = (room.interests?.length ?? 0) > 0;

  return (
    <div className="overflow-hidden rounded-lg border border-venturo-olive/20 bg-white">
      <div className="aspect-video bg-venturo-cream-alt">
        {primaryPhoto ? (
          // Plain <img> for now — external placeholder URLs; switch to
          // next/image once photos come from Supabase Storage and we can
          // allowlist that domain.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={primaryPhoto.url}
            alt={room.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-foreground/40">
            No photo yet
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold">{room.title}</h3>
          {!isAvailable && (
            <span className="shrink-0 rounded-full bg-foreground/10 px-2 py-0.5 text-xs">
              Unavailable
            </span>
          )}
        </div>
        <p className="text-sm text-foreground/60">{room.address}</p>
        <p className="text-sm text-foreground/80 line-clamp-2">{room.description}</p>
        <div className="mt-1 flex items-center justify-between text-sm">
          <span className="font-medium text-venturo-olive">
            {formatWeeklyPrice(room.price)}
          </span>
          <span className="text-foreground/60">
            {room.leaseLengthMonths} month lease
          </span>
        </div>

        {isAvailable ? (
          <Link
            href={`/rent-a-room/${room.id}`}
            className="mt-2 rounded bg-venturo-olive px-4 py-2 text-center text-sm font-medium text-white"
          >
            Rent this room
          </Link>
        ) : hasInterest ? (
          <p className="mt-2 rounded border border-venturo-olive/30 px-4 py-2 text-center text-sm text-foreground/60">
            You&apos;re on the notify list ✓
          </p>
        ) : isLoggedIn ? (
          <form action={createInterest}>
            <input type="hidden" name="roomId" value={room.id} />
            <button
              type="submit"
              className="mt-2 w-full rounded border border-venturo-olive/30 px-4 py-2 text-sm font-medium text-venturo-olive"
            >
              Notify me when available
            </button>
          </form>
        ) : (
          <Link
            href="/login"
            className="mt-2 rounded border border-venturo-olive/30 px-4 py-2 text-center text-sm font-medium text-venturo-olive"
          >
            Log in to get notified
          </Link>
        )}
      </div>
    </div>
  );
}
