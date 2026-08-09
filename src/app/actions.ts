"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function createInterest(formData: FormData) {
  const roomId = formData.get("roomId") as string;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Upsert with an empty `update` — the @@unique([userId, roomId]) constraint
  // means a second click just no-ops instead of erroring or creating a
  // duplicate row. Interest history is permanent (never deleted), so this is
  // the only way a repeat click should behave.
  await prisma.interest.upsert({
    where: { userId_roomId: { userId: user.id, roomId } },
    create: { userId: user.id, roomId },
    update: {},
  });

  revalidatePath("/rent-a-room", "layout");
  revalidatePath("/", "layout");
}
