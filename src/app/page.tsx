import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { RoomCard } from "@/components/room-card";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

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
      <section className="border-b border-venturo-olive/10">
        <Container className="py-24 text-center sm:py-32">
          <h1 className="mx-auto max-w-3xl text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-6xl">
            Find your next room with{" "}
            <span className="text-venturo-olive">Venturo</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-foreground/70">
            Furnished share-house rooms, managed properly, rented simply.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <ButtonLink href="/rent-a-room" size="lg">
              Browse available rooms
            </ButtonLink>
            <ButtonLink href="/about" variant="secondary" size="lg">
              Learn more
            </ButtonLink>
          </div>
        </Container>
      </section>

      <section className="border-b border-venturo-olive/10">
        <Container className="py-16 sm:py-20">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title}>
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-venturo-olive/10 text-venturo-olive">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.75}
                  >
                    {feature.icon}
                  </svg>
                </div>
                <h2 className="mt-4 font-semibold text-foreground">{feature.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-foreground/70">
                  {feature.body}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {featuredRooms.length > 0 && (
        <section>
          <Container className="py-16 sm:py-20">
            <div className="flex items-end justify-between">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                Available now
              </h2>
              <ButtonLink href="/rent-a-room" variant="secondary">
                See all rooms
              </ButtonLink>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredRooms.map((room) => (
                <RoomCard key={room.id} room={room} isLoggedIn={!!user} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </div>
  );
}
