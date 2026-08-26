"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function updateEmail(formData: FormData) {
  await requireUser();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const email = (formData.get("email") as string).trim();
  if (!email || email === user.email) {
    redirect("/account/profile");
  }

  // The change doesn't take effect until the user clicks the confirmation
  // link Supabase emails to the new address — public."User".email is kept
  // in sync separately by the on_auth_user_email_updated trigger (see
  // supabase/sql/002_sync_user_email.sql), not updated here.
  const headersList = await headers();
  const origin = `${headersList.get("x-forwarded-proto") ?? "http"}://${headersList.get("host")}`;

  const { error } = await supabase.auth.updateUser(
    { email },
    { emailRedirectTo: `${origin}/auth/confirm?next=/account/profile` },
  );

  if (error) {
    redirect(`/account/profile?emailError=${encodeURIComponent(error.message)}`);
  }

  redirect("/account/profile?emailChangeSent=1");
}

export async function updateProfile(formData: FormData) {
  const dbUser = await requireUser();

  const name = (formData.get("name") as string).trim();
  const lastName = (formData.get("lastName") as string).trim();
  const phone = (formData.get("phone") as string).trim();

  await prisma.user.update({
    where: { id: dbUser.id },
    data: {
      name: name || null,
      lastName: lastName || null,
      phone: phone || null,
    },
  });

  revalidatePath("/account/profile");
  revalidatePath("/", "layout");
}

export async function updateEmergencyContact(formData: FormData) {
  const dbUser = await requireUser();

  const emergencyContactName = (formData.get("emergencyContactName") as string).trim();
  const emergencyContactPhone = (formData.get("emergencyContactPhone") as string).trim();

  await prisma.user.update({
    where: { id: dbUser.id },
    data: {
      emergencyContactName: emergencyContactName || null,
      emergencyContactPhone: emergencyContactPhone || null,
    },
  });

  revalidatePath("/account/profile");
}

export async function updateNotificationPreferences(formData: FormData) {
  const dbUser = await requireUser();

  const notifyEmailUpdates = formData.get("notifyEmailUpdates") === "on";

  await prisma.user.update({
    where: { id: dbUser.id },
    data: { notifyEmailUpdates },
  });

  revalidatePath("/account/profile");
}

export async function deleteAccount() {
  const dbUser = await requireUser();

  // Same rule as deleting a room out from under a tenant (see
  // admin/homes/[homeId]/rooms/[roomId]/actions.ts) — an active lease means
  // someone else (the room, the admin side) still depends on this account.
  // An admin has to terminate the lease first.
  const activeLeaseCount = await prisma.contract.count({
    where: { userId: dbUser.id, endedAt: null },
  });
  if (activeLeaseCount > 0) {
    redirect("/account/profile?deleteError=active-lease");
  }

  // Contract/Application/Interest/RoomQuestion rows are kept as permanent
  // history and still point at this userId (that FK is what makes a real
  // row delete impossible anyway), so this scrubs PII and soft-deletes
  // instead of removing the row — the same shape as Home/Room's deletedAt.
  await prisma.user.update({
    where: { id: dbUser.id },
    data: {
      name: null,
      lastName: null,
      phone: null,
      emergencyContactName: null,
      emergencyContactPhone: null,
      deletedAt: new Date(),
    },
  });

  // Removes their ability to log back in at all — the part of "permanently
  // delete" that actually matters to the user. Uses the admin client since
  // a user can't delete their own Supabase auth account via the regular
  // client SDK.
  await createAdminClient().auth.admin.deleteUser(dbUser.id);

  const supabase = await createClient();
  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  redirect("/login?deleted=1");
}
