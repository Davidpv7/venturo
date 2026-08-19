import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { markQuestionRead, archiveQuestion, unarchiveQuestion } from "./actions";

export default async function AdminQuestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();
  const { status } = await searchParams;
  const showArchived = status === "archived";

  const questions = await prisma.roomQuestion.findMany({
    where: showArchived ? { archivedAt: { not: null } } : { archivedAt: null },
    orderBy: { createdAt: "desc" },
    include: { user: true, room: { include: { home: true } } },
  });

  return (
    <Container size="md" className="py-16 sm:py-20">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Questions
      </h1>
      <p className="mt-4 max-w-xl text-foreground/80">
        Questions asked from room listings. Reply directly via email — this is
        an inbox, not a chat.
      </p>

      <div className="mt-6 flex gap-2 text-sm">
        <Link
          href="/admin/questions"
          className={`rounded-full px-3 py-1 font-medium ${
            !showArchived
              ? "bg-venturo-olive/10 text-venturo-olive"
              : "text-foreground/60 hover:text-venturo-olive"
          }`}
        >
          Active
        </Link>
        <Link
          href="/admin/questions?status=archived"
          className={`rounded-full px-3 py-1 font-medium ${
            showArchived
              ? "bg-venturo-olive/10 text-venturo-olive"
              : "text-foreground/60 hover:text-venturo-olive"
          }`}
        >
          Archived
        </Link>
      </div>

      {questions.length === 0 ? (
        <p className="mt-8 text-sm text-foreground/60">
          {showArchived ? "No archived questions." : "No questions yet."}
        </p>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {questions.map((question) => {
            const unread = !question.archivedAt && question.readAt === null;
            const askerName = [question.user.name, question.user.lastName]
              .filter(Boolean)
              .join(" ") || question.user.email;
            return (
              <Card key={question.id} className={unread ? "border-venturo-olive/40" : ""}>
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
                        {askerName}
                      </span>
                    </div>
                    <a
                      href={`mailto:${question.user.email}`}
                      className="text-sm text-venturo-olive hover:underline"
                    >
                      {question.user.email}
                    </a>
                    <p className="mt-1 text-sm text-foreground/60">
                      About{" "}
                      <Link
                        href={`/admin/homes/${question.room.homeId}/rooms/${question.roomId}`}
                        className="text-venturo-olive hover:underline"
                      >
                        {question.room.title}
                      </Link>{" "}
                      — {question.room.home.name}
                    </p>
                  </div>
                  <span className="text-xs text-foreground/50">
                    {question.createdAt.toLocaleString("en-AU")}
                  </span>
                </div>

                <p className="mt-4 whitespace-pre-wrap text-sm text-foreground/80">
                  {question.message}
                </p>

                <div className="mt-4 flex flex-wrap gap-2 border-t border-venturo-olive/10 pt-4">
                  {unread && (
                    <form action={markQuestionRead}>
                      <input type="hidden" name="questionId" value={question.id} />
                      <Button type="submit" size="sm">
                        Mark as read
                      </Button>
                    </form>
                  )}
                  {showArchived ? (
                    <form action={unarchiveQuestion}>
                      <input type="hidden" name="questionId" value={question.id} />
                      <Button type="submit" variant="secondary" size="sm">
                        Unarchive
                      </Button>
                    </form>
                  ) : (
                    <form action={archiveQuestion}>
                      <input type="hidden" name="questionId" value={question.id} />
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
