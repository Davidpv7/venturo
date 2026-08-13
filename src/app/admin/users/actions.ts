"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export async function setUserRole(formData: FormData) {
  await requireAdmin();
  const userId = formData.get("userId") as string;
  const role = formData.get("role") as "ADMIN" | "USER";

  await prisma.user.update({ where: { id: userId }, data: { role } });

  revalidatePath("/admin/users");
}
