"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { revalidateRoomPaths } from "@/lib/admin-revalidate";

export async function createHome(formData: FormData) {
  await requireAdmin();

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const address = formData.get("address") as string;

  const home = await prisma.home.create({
    data: { name, description, address },
  });

  revalidateRoomPaths();
  redirect(`/admin/homes/${home.id}`);
}
