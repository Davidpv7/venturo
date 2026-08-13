"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function sendContactMessage(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const message = formData.get("message") as string;

  // TODO: also send an email notification via Resend once it's wired up
  // (same integration the "room available again" notify-me emails will
  // use) — for now this is read via the admin Messages inbox instead.
  await prisma.contactMessage.create({ data: { name, email, message } });

  redirect("/contact?sent=1");
}
