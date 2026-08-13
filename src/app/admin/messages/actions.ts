"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export async function markMessageRead(formData: FormData) {
  await requireAdmin();
  const messageId = formData.get("messageId") as string;

  await prisma.contactMessage.update({
    where: { id: messageId },
    data: { readAt: new Date() },
  });

  revalidatePath("/admin/messages");
}

export async function archiveMessage(formData: FormData) {
  await requireAdmin();
  const messageId = formData.get("messageId") as string;

  await prisma.contactMessage.update({
    where: { id: messageId },
    data: { archivedAt: new Date() },
  });

  revalidatePath("/admin/messages");
}

export async function unarchiveMessage(formData: FormData) {
  await requireAdmin();
  const messageId = formData.get("messageId") as string;

  await prisma.contactMessage.update({
    where: { id: messageId },
    data: { archivedAt: null },
  });

  revalidatePath("/admin/messages");
}
