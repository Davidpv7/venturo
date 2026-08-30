"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { requireVerifiedUser } from "@/lib/require-verified-user";
import { sendEmail, roomQuestionEmail, getAdminEmails } from "@/lib/email";

// Finds the applicant's existing in-progress application for this room, if
// any, rather than creating a duplicate — but only among active statuses,
// so a previously REJECTED (or already APPROVED) application doesn't block
// starting a fresh one.
export async function startOrResumeApplication(formData: FormData) {
  const roomId = formData.get("roomId") as string;

  const dbUser = await requireVerifiedUser();

  const existing = await prisma.application.findFirst({
    where: { userId: dbUser.id, roomId, status: { in: ["DRAFT", "SUBMITTED", "UNDER_REVIEW"] } },
  });

  const application =
    existing ?? (await prisma.application.create({ data: { userId: dbUser.id, roomId } }));

  redirect(`/apply/${application.id}/personal`);
}

export async function askRoomQuestion(formData: FormData) {
  const roomId = formData.get("roomId") as string;
  const homeId = formData.get("homeId") as string;
  const message = formData.get("message") as string;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
  const room = await prisma.room.findUniqueOrThrow({
    where: { id: roomId },
    include: { home: true },
  });

  await prisma.roomQuestion.create({
    data: { userId: dbUser.id, roomId, message },
  });

  const { subject, html, text } = roomQuestionEmail(
    dbUser.name ?? dbUser.email,
    room.title,
    room.home.name,
    homeId,
    roomId,
    message,
  );
  await sendEmail({ to: await getAdminEmails(), subject, html, text, replyTo: dbUser.email });

  redirect(`/rent-a-room/${homeId}/${roomId}?asked=1`);
}
