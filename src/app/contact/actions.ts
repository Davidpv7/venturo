"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { sendEmail, contactMessageEmail, ADMIN_EMAIL } from "@/lib/email";

export async function sendContactMessage(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const message = formData.get("message") as string;

  await prisma.contactMessage.create({ data: { name, email, message } });

  const { subject, html, text } = contactMessageEmail(name, email, message);
  await sendEmail({ to: ADMIN_EMAIL, subject, html, text, replyTo: email });

  redirect("/contact?sent=1");
}
