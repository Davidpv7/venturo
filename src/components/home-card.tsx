import Image from "next/image";
import type { Home, Photo } from "@/generated/prisma/client";
import { ButtonLink } from "@/components/ui/button";

type HomeWithPhotos = Home & { photos: Photo[] };

export function HomeCard({ home }: { home: HomeWithPhotos }) {
  const primaryPhoto = home.photos.find((p) => p.order === 0) ?? home.photos[0];

  return (
    <div className="group overflow-hidden rounded-xl border border-venturo-olive/15 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-video overflow-hidden bg-venturo-cream-alt">
        {primaryPhoto ? (
          <Image
            src={primaryPhoto.url}
            alt={home.name}
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
        <h3 className="font-semibold text-foreground">{home.name}</h3>
        <p className="text-sm text-foreground/60">{home.address}</p>
        <p className="text-sm text-foreground/80 line-clamp-2">{home.description}</p>

        <ButtonLink href={`/rent-a-room/${home.id}`} className="mt-3">
          See rooms in this home
        </ButtonLink>
      </div>
    </div>
  );
}
