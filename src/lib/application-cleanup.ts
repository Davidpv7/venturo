import { prisma } from "@/lib/prisma";
import { deleteApplicationDocuments } from "@/lib/application-documents";

// Rejected applications are flagged for deletion 60 days after rejection
// (Application.deleteAfter, set by rejectApplication). Approved/draft/
// submitted/under-review applications never get deleteAfter set, so they're
// excluded from this scan automatically.
export async function cleanupRejectedApplications() {
  const toDelete = await prisma.application.findMany({
    where: { status: "REJECTED", deleteAfter: { lte: new Date() } },
    select: { id: true },
  });

  for (const { id } of toDelete) {
    // No onDelete: Cascade anywhere in this schema — documents (DB rows +
    // Storage objects) must be removed before the Application row itself.
    await deleteApplicationDocuments(id);
    await prisma.application.delete({ where: { id } });
  }

  return toDelete.length;
}
