"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { sendEmail, contactMessageEmail, ADMIN_EMAIL } from "@/lib/email";
import { verifyTurnstileToken } from "@/lib/turnstile";

export async function sendContactMessage(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const message = formData.get("message") as string;
  const captchaToken = formData.get("cf-turnstile-response") as string | null;

  const verified = await verifyTurnstileToken(captchaToken);
  if (!verified) {
    redirect(`/contact?error=${encodeURIComponent("Verification failed. Please try again.")}`);
  }

  await prisma.contactMessage.create({ data: { name, email, message } });

  const { subject, html, text } = contactMessageEmail(name, email, message);
  await sendEmail({ to: ADMIN_EMAIL, subject, html, text, replyTo: email });

  redirect("/contact?sent=1");
}
