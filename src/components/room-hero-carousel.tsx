"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Home, Photo } from "@/generated/prisma/client";
import { formatWeeklyPrice } from "@/lib/format";

type HomeWithPhotosAndPrice = Home & { photos: Photo[]; rooms: { price: number }[] };

// How far each neighboring card sits from the centered one.
const OFFSET = "clamp(140px, 26vw, 260px)";

function diffFor(i: number, index: number, count: number) {
  let diff = i - index;
  if (diff > count / 2) diff -= count;
  if (diff < -count / 2) diff += count;
  return diff;
}

function cardStyle(diff: number): CSSProperties {
  const abs = Math.abs(diff);
  const scale = abs === 0 ? 1 : abs === 1 ? 0.78 : 0.6;
  const blur = abs === 0 ? 0 : abs === 1 ? 4 : 8;
  const opacity = abs === 0 ? 1 : abs === 1 ? 0.45 : 0;

  return {
    transform: `translate(-50%, -50%) translateX(calc(${diff} * ${OFFSET})) scale(${scale})`,
    filter: `blur(${blur}px)`,
    opacity,
    zIndex: 10 - abs,
    pointerEvents: abs <= 1 ? "auto" : "none",
  };
}

export function HeroEmptyState() {
  return (
    <div className="flex h-[420px] items-center justify-center rounded-2xl border border-venturo-olive/20 bg-venturo-cream-alt/60 px-6 text-center sm:h-[480px]">
      <p className="max-w-xs text-foreground/60">
        New rooms coming soon — check back shortly.
      </p>
    </div>
  );
}

export function RoomHeroCarousel({ homes }: { homes: HomeWithPhotosAndPrice[] }) {
  const [index, setIndex] = useState(0);
  const count = homes.length;
  const touchStartX = useRef<number | null>(null);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % count);
  }, [count]);

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + count) % count);
  }, [count]);

  useEffect(() => {
    if (count <= 1) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [count, next, prev]);

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(deltaX) < 50) return;
    if (deltaX > 0) prev();
    else next();
  }

  return (
    <div>
      <div
        role="group"
        aria-roledescription="carousel"
        className="relative h-[420px] w-full sm:h-[480px]"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {homes.map((home, i) => {
          const diff = diffFor(i, index, count);
          const isCenter = diff === 0;
          const isSide = Math.abs(diff) === 1;
          const primaryPhoto = home.photos.find((p) => p.order === 0) ?? home.photos[0];

          const card = (
            <div className="relative h-full w-full overflow-hidden rounded-2xl shadow-lg">
              {primaryPhoto ? (
                <Image
                  src={primaryPhoto.url}
                  alt={home.name}
                  fill
                  sizes="(min-width: 640px) 420px, 80vw"
                  className="object-cover"
                  priority={isCenter}
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-venturo-cream-alt text-sm text-foreground/40">
                  No photo yet
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent p-5">
                <p className="font-display text-lg font-semibold text-white">{home.name}</p>
                <div className="mt-1 flex items-center justify-between gap-3 text-sm text-white/80">
                  <span className="truncate">{home.address}</span>
                  {home.rooms[0] && (
                    <span className="shrink-0 font-medium text-white">
                      from {formatWeeklyPrice(home.rooms[0].price)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );

          return (
            <div
              key={home.id}
              style={cardStyle(diff)}
              className={`absolute top-1/2 left-1/2 aspect-[4/5] w-[85vw] transition-all duration-500 ease-out sm:aspect-[16/10] sm:w-[min(560px,60vw)] ${
                isCenter ? "" : "hidden sm:block"
              }`}
            >
              {isCenter ? (
                <Link
                  href={`/rent-a-room/${home.id}`}
                  aria-label={`View ${home.name}`}
                  className="block h-full w-full"
                >
                  {card}
                </Link>
              ) : isSide ? (
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Show ${home.name}`}
                  className="block h-full w-full cursor-pointer"
                >
                  {card}
                </button>
              ) : (
                card
              )}
            </div>
          );
        })}

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous home"
              className="absolute left-2 top-1/2 z-[15] flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-venturo-olive/30 bg-venturo-cream/90 text-venturo-olive backdrop-blur hover:bg-venturo-olive/10 sm:left-4 sm:h-11 sm:w-11"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 6l-6 6 6 6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next home"
              className="absolute right-2 top-1/2 z-[15] flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-venturo-olive/30 bg-venturo-cream/90 text-venturo-olive backdrop-blur hover:bg-venturo-olive/10 sm:right-4 sm:h-11 sm:w-11"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
              </svg>
            </button>
          </>
        )}

        <p className="sr-only" aria-live="polite">
          Home {index + 1} of {count}
        </p>
      </div>

      {count > 1 && (
        <div className="mt-5 flex justify-center gap-2">
          {homes.map((home, i) => (
            <button
              key={home.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to home ${i + 1}`}
              className={`h-1.5 cursor-pointer rounded-full transition-all ${
                i === index ? "w-4 bg-venturo-olive" : "w-1.5 bg-venturo-olive/25"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
