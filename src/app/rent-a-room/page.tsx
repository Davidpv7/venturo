import { prisma } from "@/lib/prisma";
import { HomeCard } from "@/components/home-card";
import { Container } from "@/components/ui/container";

export default async function RentARoomPage() {
  const homes = await prisma.home.findMany({
    where: { deletedAt: null },
    include: { photos: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <Container className="py-16 sm:py-20">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Rent a Room
      </h1>
      <p className="mt-3 max-w-xl text-foreground/70">
        Browse our homes below, then pick the room inside that suits you.
      </p>

      {homes.length === 0 ? (
        <p className="mt-10 text-foreground/60">
          No homes listed right now — check back soon.
        </p>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {homes.map((home) => (
            <HomeCard key={home.id} home={home} />
          ))}
        </div>
      )}
    </Container>
  );
}
