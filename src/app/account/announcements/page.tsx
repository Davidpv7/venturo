import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";

export default async function AnnouncementsPage() {
  const dbUser = await requireUser();

  const contracts = await prisma.contract.findMany({
    where: { userId: dbUser.id },
    select: { room: { select: { homeId: true } } },
  });
  const homeIds = [...new Set(contracts.map((contract) => contract.room.homeId))];

  const announcements = homeIds.length
    ? await prisma.announcement.findMany({
        where: { homeId: { in: homeIds } },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <Container size="sm" className="py-16 sm:py-20">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Announcements
      </h1>

      {announcements.length === 0 ? (
        <p className="mt-4 text-sm text-foreground/60">No announcements yet.</p>
      ) : (
        <ul className="mt-8 flex flex-col gap-4">
          {announcements.map((announcement) => (
            <li key={announcement.id}>
              <Card>
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-semibold text-foreground">{announcement.title}</h2>
                  <span className="shrink-0 text-xs text-foreground/50">
                    {announcement.createdAt.toLocaleDateString("en-AU")}
                  </span>
                </div>
                <p className="mt-2 whitespace-pre-line text-sm text-foreground/80">
                  {announcement.body}
                </p>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
