import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { RoomHeroCarousel, HeroEmptyState } from "@/components/room-hero-carousel";
import { formatWeeklyPrice } from "@/lib/format";

const features = [
  {
    title: "Fully furnished, bills included",
    body: "Move in with a bag, not a moving truck. Rooms come furnished, and your rent covers utilities.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 11.5 12 4l9 7.5M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9"
      />
    ),
  },
  {
    title: "Professionally managed",
    body: "One landlord, one point of contact — no faceless agency, no runaround when something needs fixing.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3 4 6v5c0 4.4 3.2 8.3 8 9.5 4.8-1.2 8-5.1 8-9.5V6l-8-3Z"
      />
    ),
  },
  {
    title: "Simple, honest process",
    body: "Browse listings, sign your lease online, sort the deposit — no hidden fees or surprise conditions.",
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />,
  },
];

export default async function HomePage() {
  const homes = await prisma.home.findMany({
    where: { rooms: { some: { status: "AVAILABLE" } } },
    include: {
      photos: true,
      rooms: {
        where: { status: "AVAILABLE" },
        orderBy: { price: "asc" },
        take: 1,
        select: { price: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  return (
    <div>
      <section className="overflow-hidden border-b border-venturo-olive/10 bg-gradient-to-b from-venturo-cream-alt to-venturo-cream">
        <Container size="lg" className="py-16 sm:py-24">
          <div className="max-w-2xl">
            <p className="text-sm font-medium tracking-wide text-venturo-olive uppercase">
              Venturo co-living
            </p>
            <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
              A room that already feels like{" "}
              <em className="text-venturo-olive italic">home</em>
            </h1>
            <p className="mt-4 max-w-xl text-lg text-foreground/70">
              Furnished, bills included, one point of contact — browse the rooms
              available right now.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <ButtonLink href="/rent-a-room" size="lg">
                Browse available rooms
              </ButtonLink>
              <ButtonLink href="/about" variant="secondary" size="lg">
                Learn more
              </ButtonLink>
            </div>
          </div>

          <div className="mt-14">
            {homes.length > 0 ? (
              <RoomHeroCarousel homes={homes} />
            ) : (
              <HeroEmptyState />
            )}
          </div>
        </Container>
      </section>

      <section className="border-b border-venturo-olive/10 bg-venturo-cream-alt/40">
        <Container className="py-16 sm:py-20">
          <div className="grid grid-cols-1 divide-y divide-venturo-olive/15 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="py-8 first:pt-0 sm:px-8 sm:py-0 sm:first:pl-0 sm:last:pr-0"
              >
                <span className="font-display text-3xl text-venturo-olive/30">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <svg
                  viewBox="0 0 24 24"
                  className="mt-3 h-5 w-5 text-venturo-olive"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.75}
                >
                  {feature.icon}
                </svg>
                <h2 className="font-display mt-3 text-lg font-semibold text-foreground">
                  {feature.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-foreground/70">
                  {feature.body}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {homes.length > 0 && (
        <section>
          <Container className="py-16 sm:py-20">
            <div className="flex items-end justify-between">
              <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
                Available now
              </h2>
              <ButtonLink href="/rent-a-room" variant="secondary">
                See all rooms
              </ButtonLink>
            </div>
            <ul className="mt-8 divide-y divide-venturo-olive/10 rounded-xl border border-venturo-olive/15 bg-white">
              {homes.slice(0, 6).map((home) => {
                const primaryPhoto =
                  home.photos.find((p) => p.order === 0) ?? home.photos[0];
                return (
                  <li key={home.id}>
                    <Link
                      href={`/rent-a-room/${home.id}`}
                      className="flex items-center gap-4 p-4 transition-colors hover:bg-venturo-olive/5"
                    >
                      {primaryPhoto ? (
                        <Image
                          src={primaryPhoto.url}
                          alt={home.name}
                          width={64}
                          height={64}
                          className="h-16 w-16 shrink-0 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-venturo-cream-alt text-xs text-foreground/40">
                          No photo
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-foreground">
                          {home.name}
                        </p>
                        <p className="truncate text-sm text-foreground/60">
                          {home.address}
                        </p>
                      </div>
                      {home.rooms[0] && (
                        <span className="shrink-0 font-medium text-venturo-olive">
                          from {formatWeeklyPrice(home.rooms[0].price)}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Container>
        </section>
      )}
    </div>
  );
}
