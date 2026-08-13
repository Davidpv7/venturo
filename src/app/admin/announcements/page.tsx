import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Field, inputClasses } from "@/components/ui/field";
import { createAnnouncement, deleteAnnouncement } from "./actions";

export default async function AdminAnnouncementsPage() {
  await requireAdmin();

  const [homes, announcements] = await Promise.all([
    prisma.home.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
    prisma.announcement.findMany({
      include: { home: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <Container size="md" className="py-16 sm:py-20">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Announcements
      </h1>
      <p className="mt-4 max-w-xl text-foreground/80">
        House-wide announcements shown to tenants of the selected home.
      </p>

      <Card className="mt-8">
        <h2 className="font-semibold text-foreground">Post an announcement</h2>
        <form action={createAnnouncement} className="mt-4 flex flex-col gap-4">
          <Field label="Home">
            <select name="homeId" required defaultValue="" className={inputClasses}>
              <option value="" disabled>
                Select a home
              </option>
              {homes.map((home) => (
                <option key={home.id} value={home.id}>
                  {home.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Title">
            <input name="title" type="text" required className={inputClasses} />
          </Field>
          <Field label="Message">
            <textarea name="body" required rows={4} className={inputClasses} />
          </Field>
          <Button type="submit" className="self-start">
            Post
          </Button>
        </form>
      </Card>

      {announcements.length === 0 ? (
        <p className="mt-8 text-sm text-foreground/60">No announcements yet.</p>
      ) : (
        <ul className="mt-8 flex flex-col gap-4">
          {announcements.map((announcement) => (
            <li key={announcement.id}>
              <Card>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-foreground">{announcement.title}</h2>
                    <p className="text-xs text-foreground/50">
                      {announcement.home.name} · {announcement.createdAt.toLocaleDateString("en-AU")}
                    </p>
                  </div>
                  <form action={deleteAnnouncement}>
                    <input type="hidden" name="announcementId" value={announcement.id} />
                    <Button type="submit" variant="secondary" size="sm">
                      Delete
                    </Button>
                  </form>
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
