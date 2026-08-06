"use client";

import { useState } from "react";
import type { Photo } from "@/generated/prisma/client";

export function RoomPhotoGallery({
  photos,
  title,
}: {
  photos: Photo[];
  title: string;
}) {
  const sorted = [...photos].sort((a, b) => a.order - b.order);
  const [activeIndex, setActiveIndex] = useState(0);
  const active = sorted[activeIndex];

  if (sorted.length === 0) {
    return (
      <div className="aspect-[16/10] overflow-hidden rounded-xl bg-venturo-cream-alt">
        <div className="flex h-full items-center justify-center text-sm text-foreground/40">
          No photo yet
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="aspect-[16/10] overflow-hidden rounded-xl bg-venturo-cream-alt">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={active.url}
          alt={title}
          className="h-full w-full object-cover"
        />
      </div>

      {sorted.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {sorted.map((photo, i) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setActiveIndex(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === activeIndex}
              className={`aspect-square w-16 shrink-0 overflow-hidden rounded-lg sm:w-20 ${
                i === activeIndex
                  ? "ring-2 ring-venturo-olive"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt=""
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
