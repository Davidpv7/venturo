import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { markMessageRead, archiveMessage, unarchiveMessage } from "./actions";

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();
  const { status } = await searchParams;
  const showArchived = status === "archived";

  const messages = await prisma.contactMessage.findMany({
    where: showArchived ? { archivedAt: { not: null } } : { archivedAt: null },
    orderBy: { createdAt: "desc" },
  });

  return (
    <Container size="md" className="py-16 sm:py-20">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Messages
      </h1>
      <p className="mt-4 max-w-xl text-foreground/80">
        Submissions from the public contact form. Reply directly via email — this is an
        inbox, not a chat.
      </p>

      <div className="mt-6 flex gap-2 text-sm">
        <Link
          href="/admin/messages"
          className={`rounded-full px-3 py-1 font-medium ${
            !showArchived
              ? "bg-venturo-olive/10 text-venturo-olive"
              : "text-foreground/60 hover:text-venturo-olive"
          }`}
        >
          Active
        </Link>
        <Link
          href="/admin/messages?status=archived"
          className={`rounded-full px-3 py-1 font-medium ${
            showArchived
              ? "bg-venturo-olive/10 text-venturo-olive"
              : "text-foreground/60 hover:text-venturo-olive"
          }`}
        >
          Archived
        </Link>
      </div>

      {messages.length === 0 ? (
        <p className="mt-8 text-sm text-foreground/60">
          {showArchived ? "No archived messages." : "No messages yet."}
        </p>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {messages.map((message) => {
            const unread = !message.archivedAt && message.readAt === null;
            return (
              <Card key={message.id} className={unread ? "border-venturo-olive/40" : ""}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      {unread && (
                        <span
                          aria-label="Unread"
                          className="size-2 rounded-full bg-venturo-olive"
                        />
                      )}
                      <span className={unread ? "font-semibold text-foreground" : "font-medium text-foreground"}>
                        {message.name}
                      </span>
                    </div>
                    <a
                      href={`mailto:${message.email}`}
                      className="text-sm text-venturo-olive hover:underline"
                    >
                      {message.email}
                    </a>
                  </div>
                  <span className="text-xs text-foreground/50">
                    {message.createdAt.toLocaleString("en-AU")}
                  </span>
                </div>

                <p className="mt-4 whitespace-pre-wrap text-sm text-foreground/80">
                  {message.message}
                </p>

                <div className="mt-4 flex flex-wrap gap-2 border-t border-venturo-olive/10 pt-4">
                  {unread && (
                    <form action={markMessageRead}>
                      <input type="hidden" name="messageId" value={message.id} />
                      <Button type="submit" size="sm">
                        Mark as read
                      </Button>
                    </form>
                  )}
                  {showArchived ? (
                    <form action={unarchiveMessage}>
                      <input type="hidden" name="messageId" value={message.id} />
                      <Button type="submit" variant="secondary" size="sm">
                        Unarchive
                      </Button>
                    </form>
                  ) : (
                    <form action={archiveMessage}>
                      <input type="hidden" name="messageId" value={message.id} />
                      <Button type="submit" variant="secondary" size="sm">
                        Archive
                      </Button>
                    </form>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </Container>
  );
}
