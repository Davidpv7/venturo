"use server";

import { redirect } from "next/navigation";

export async function sendContactMessage(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const message = formData.get("message") as string;

  // TODO: send via Resend once it's wired up (same integration the
  // "room available again" notify-me emails will use) — for now this just
  // logs server-side so the form is honest about what it actually does.
  console.log("[contact form submission]", { name, email, message });

  redirect("/contact?sent=1");
}
