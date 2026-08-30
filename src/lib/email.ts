import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

// Same address already used in mailto: links on the contact page and the
// room detail page's deposit instructions — kept as a last-resort fallback
// for getAdminEmails() below, in case the ADMIN role table is ever empty.
const ADMIN_EMAIL = "venturo.coliving@gmail.com";

const FROM_EMAIL = "Venturo <info@venturocoliving.com.au>";

function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

// Recipients for admin alerts: every non-deleted ADMIN-role user's real
// email, rather than a single hardcoded inbox. Falls back to ADMIN_EMAIL
// only if the ADMIN role table is somehow empty, so alerts never go nowhere.
export async function getAdminEmails(): Promise<string[]> {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN", deletedAt: null },
    select: { email: true },
  });
  const emails = admins.map((a) => a.email);
  return emails.length > 0 ? emails : [ADMIN_EMAIL];
}

type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

// If RESEND_API_KEY isn't set, logs instead of sending — same
// honesty-over-pretending fallback the pre-Resend TODOs used, so local dev
// keeps working without requiring a key.
export async function sendEmail({ to, subject, html, text, replyTo }: SendEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log("[email]", { to, subject });
    return;
  }

  const resend = new Resend(apiKey);
  // The SDK returns { data, error } rather than throwing on API-level
  // errors (bad domain, rate limit, etc.) — surface those in logs rather
  // than silently treating a failed send as delivered. Not re-thrown: a
  // failed notification shouldn't roll back the state change (e.g. an
  // application approval) that triggered it.
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html,
    text,
    ...(replyTo ? { replyTo } : {}),
  });

  if (error) {
    console.error("[email] send failed", { to, subject, error });
  }
}

export function roomAvailableEmail(roomTitle: string, homeName: string, homeId: string, roomId: string) {
  const roomUrl = `${getSiteUrl()}/rent-a-room/${homeId}/${roomId}`;
  return {
    subject: `${roomTitle} is available again`,
    text: `${roomTitle} at ${homeName} is available again. Head over and apply before it's gone: ${roomUrl}`,
    html: `<p>${roomTitle} at ${homeName} is available again. Head over and apply before it's gone:</p><p><a href="${roomUrl}">${roomUrl}</a></p>`,
  };
}

export function contactMessageEmail(name: string, email: string, message: string) {
  const adminUrl = `${getSiteUrl()}/admin/messages`;
  return {
    subject: `New contact message from ${name}`,
    text: `From: ${name} <${email}>\n\n${message}\n\nView in admin: ${adminUrl}`,
    html: `<p>From: ${name} &lt;${email}&gt;</p><p>${message}</p><p><a href="${adminUrl}">View in admin</a></p>`,
  };
}

export function applicationApprovedEmail(roomTitle: string, homeName: string, expiresAt: Date) {
  const leaseUrl = `${getSiteUrl()}/account/lease`;
  const deadline = expiresAt.toLocaleString("en-AU");
  return {
    subject: "Your application has been approved — sign your lease",
    text: `Congratulations — your application for ${roomTitle} at ${homeName} has been approved. Next steps: sign your lease and pay the deposit, both by ${deadline}, or the room will be released. Sign here: ${leaseUrl}`,
    html: `<p>Congratulations — your application for ${roomTitle} at ${homeName} has been approved.</p><p>Next steps: sign your lease and pay the deposit, both by <strong>${deadline}</strong>, or the room will be released.</p><p><a href="${leaseUrl}">${leaseUrl}</a></p>`,
  };
}

export function leaseExpiredEmail(roomTitle: string, homeName: string) {
  const roomsUrl = `${getSiteUrl()}/rent-a-room`;
  return {
    subject: "Your room reservation has expired",
    text: `Your reservation for ${roomTitle} at ${homeName} has expired because the lease wasn't signed and/or the deposit wasn't received in time, so the room has been released. Browse other rooms here: ${roomsUrl}`,
    html: `<p>Your reservation for ${roomTitle} at ${homeName} has expired because the lease wasn't signed and/or the deposit wasn't received in time, so the room has been released.</p><p><a href="${roomsUrl}">Browse other rooms</a></p>`,
  };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function roomQuestionEmail(
  askerName: string,
  roomTitle: string,
  homeName: string,
  homeId: string,
  roomId: string,
  message: string,
) {
  const roomUrl = `${getSiteUrl()}/rent-a-room/${homeId}/${roomId}`;
  const adminUrl = `${getSiteUrl()}/admin/questions`;
  return {
    subject: `Question about ${roomTitle}`,
    text: `${askerName} asked about ${roomTitle} (${homeName}):\n\n${message}\n\nRoom: ${roomUrl}\nView in admin: ${adminUrl}`,
    html: `<p>${escapeHtml(askerName)} asked about <strong>${escapeHtml(roomTitle)}</strong> (${escapeHtml(homeName)}):</p><p>${escapeHtml(message)}</p><p><a href="${roomUrl}">${roomUrl}</a></p><p><a href="${adminUrl}">View in admin</a></p>`,
  };
}

export function applicationRejectedEmail(roomTitle: string, homeName: string) {
  return {
    subject: "Update on your application",
    text: `Thanks for applying for ${roomTitle} at ${homeName} — unfortunately this application wasn't successful this time. You're welcome to apply for another room whenever you're ready.`,
    html: `<p>Thanks for applying for ${roomTitle} at ${homeName} — unfortunately this application wasn't successful this time.</p><p>You're welcome to apply for another room whenever you're ready.</p>`,
  };
}

export function applicationSubmittedEmail(roomTitle: string, homeName: string) {
  return {
    subject: "Your application was submitted successfully",
    text: `Thanks for applying for ${roomTitle} at ${homeName}. We've received your application and will be in touch once it's been reviewed.`,
    html: `<p>Thanks for applying for ${roomTitle} at ${homeName}. We've received your application and will be in touch once it's been reviewed.</p>`,
  };
}

export function newApplicationAdminEmail(
  applicantName: string,
  roomTitle: string,
  homeName: string,
  applicationId: string,
) {
  const adminUrl = `${getSiteUrl()}/admin/applications/${applicationId}`;
  return {
    subject: `New application from ${applicantName} — ${roomTitle}`,
    text: `${applicantName} submitted an application for ${roomTitle} at ${homeName}.\n\nReview it here: ${adminUrl}`,
    html: `<p>${escapeHtml(applicantName)} submitted an application for <strong>${escapeHtml(roomTitle)}</strong> (${escapeHtml(homeName)}).</p><p><a href="${adminUrl}">Review it here</a></p>`,
  };
}

export function leaseSignedEmail(roomTitle: string, homeName: string) {
  return {
    subject: "Your lease has been signed",
    text: `We've received your signed lease for ${roomTitle} at ${homeName}. Thanks — we'll be in touch with next steps.`,
    html: `<p>We've received your signed lease for ${roomTitle} at ${homeName}. Thanks — we'll be in touch with next steps.</p>`,
  };
}

export function leaseSignedAdminEmail(tenantName: string, roomTitle: string, homeName: string, contractId: string) {
  const adminUrl = `${getSiteUrl()}/admin/leases/${contractId}`;
  return {
    subject: `Lease signed by ${tenantName} — ${roomTitle}`,
    text: `${tenantName} signed their lease for ${roomTitle} at ${homeName}.\n\nView it here: ${adminUrl}`,
    html: `<p>${escapeHtml(tenantName)} signed their lease for <strong>${escapeHtml(roomTitle)}</strong> (${escapeHtml(homeName)}).</p><p><a href="${adminUrl}">View it here</a></p>`,
  };
}
