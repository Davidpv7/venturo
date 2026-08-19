"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export async function markQuestionRead(formData: FormData) {
  await requireAdmin();
  const questionId = formData.get("questionId") as string;

  await prisma.roomQuestion.update({
    where: { id: questionId },
    data: { readAt: new Date() },
  });

  revalidatePath("/admin/questions");
}

export async function archiveQuestion(formData: FormData) {
  await requireAdmin();
  const questionId = formData.get("questionId") as string;

  await prisma.roomQuestion.update({
    where: { id: questionId },
    data: { archivedAt: new Date() },
  });

  revalidatePath("/admin/questions");
}

export async function unarchiveQuestion(formData: FormData) {
  await requireAdmin();
  const questionId = formData.get("questionId") as string;

  await prisma.roomQuestion.update({
    where: { id: questionId },
    data: { archivedAt: null },
  });

  revalidatePath("/admin/questions");
}
