import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

// Same address already used in mailto: links on the contact page and the
// room detail page's deposit instructions — kept as a last-resort fallback
// for getAdminEmails() below, in case the ADMIN role table is ever empty,
// and reused as the public contact address shown in the email footer.
const ADMIN_EMAIL = "venturo.coliving@gmail.com";
const CONTACT_EMAIL = ADMIN_EMAIL;
const CONTACT_PHONE_DISPLAY = "0434 682 864";
const CONTACT_PHONE_TEL = "0434682864";

// Pulled from the venturo-olive / venturo-cream Tailwind tokens in
// globals.css — email clients strip <style>/@theme, so the shell below
// inlines the same hex values rather than referencing the CSS tokens.
const BRAND_OLIVE = "#aaa149";
const BRAND_CREAM = "#faf5eb";

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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// First name only, so a "Hi {name}," greeting reads naturally even when the
// DB has a full legal name in this field.
function firstName(name?: string | null) {
  return name?.trim().split(/\s+/)[0] || null;
}

function greetingHtml(name?: string | null) {
  const first = firstName(name);
  return `<p style="margin:0 0 16px;">Hi ${first ? escapeHtml(first) : "there"},</p>`;
}

function greetingText(name?: string | null) {
  const first = firstName(name);
  return `Hi ${first ?? "there"},\n\n`;
}

function ctaButtonHtml(label: string, url: string) {
  return `<p style="margin:24px 0 0;"><a href="${url}" style="display:inline-block;background:${BRAND_OLIVE};color:#ffffff;text-decoration:none;padding:10px 22px;border-radius:8px;font-weight:600;font-size:14px;">${escapeHtml(label)}</a></p>`;
}

// Shared branded shell (wordmark header + contact footer) every outgoing
// email is wrapped in, so all automated messages look and read the same way
// regardless of which action triggered them.
function emailShell(bodyHtml: string) {
  const siteUrl = getSiteUrl();
  return `
<div style="font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#33321f;">
  <div style="background:${BRAND_CREAM};border:1px solid rgba(170,161,73,0.2);border-radius:12px;padding:32px;margin-top:28px;font-size:15px;line-height:1.65;">
    ${bodyHtml}
  </div>
  <div style="padding:24px 4px 8px;text-align:center;">
    <a href="${siteUrl}" style="text-decoration:none;">
      <img src="${siteUrl}/venturo-logo-email.jpg" width="170" alt="Venturo Co-living" style="display:inline-block;height:auto;border:0;max-width:170px;" />
    </a>
  </div>
  <div style="padding:8px 4px 8px;font-size:12px;color:#7a7a68;line-height:1.6;text-align:center;">
    <p style="margin:0;">
      <a href="mailto:${CONTACT_EMAIL}" style="color:${BRAND_OLIVE};text-decoration:none;">${CONTACT_EMAIL}</a>
      &nbsp;&middot;&nbsp;
      <a href="tel:${CONTACT_PHONE_TEL}" style="color:${BRAND_OLIVE};text-decoration:none;">${CONTACT_PHONE_DISPLAY}</a>
    </p>
  </div>
</div>`.trim();
}

function signOffHtml() {
  return `<p style="margin:24px 0 0;">Warm regards,<br />The Venturo Team</p>`;
}

function signOffText() {
  return `\n\nWarm regards,\nThe Venturo Team\n${CONTACT_EMAIL} | ${CONTACT_PHONE_DISPLAY}`;
}

export function roomAvailableEmail(
  recipientName: string | null,
  roomTitle: string,
  homeName: string,
  homeId: string,
  roomId: string,
) {
  const roomUrl = `${getSiteUrl()}/rent-a-room/${homeId}/${roomId}`;
  return {
    subject: `${roomTitle} is available again`,
    text: `${greetingText(recipientName)}Good news — the room you were watching, ${roomTitle} at ${homeName}, has just become available again. Rooms like this tend to move fast, so take another look and apply if you're still interested: ${roomUrl}${signOffText()}`,
    html: emailShell(
      `${greetingHtml(recipientName)}<p style="margin:0;">Good news — the room you were watching, <strong>${roomTitle}</strong> at ${homeName}, has just become available again. Rooms like this tend to move fast, so take another look if you're still interested.</p>${ctaButtonHtml(
        "View the room",
        roomUrl,
      )}${signOffHtml()}`,
    ),
  };
}

export function contactMessageEmail(name: string, email: string, message: string) {
  const adminUrl = `${getSiteUrl()}/admin/messages`;
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message);
  return {
    subject: `New contact message from ${name}`,
    text: `Hi team,\n\nA new message came in through the Venturo contact form.\n\nFrom: ${name} <${email}>\n\n${message}\n\nReply directly to this email to respond, or view it in the admin dashboard: ${adminUrl}${signOffText()}`,
    html: emailShell(
      `<p style="margin:0 0 16px;">Hi team,</p><p style="margin:0 0 16px;">A new message came in through the Venturo contact form.</p><p style="margin:0 0 4px;">From: ${safeName} &lt;${safeEmail}&gt;</p><p style="margin:0;">${safeMessage}</p>${ctaButtonHtml(
        "View in admin",
        adminUrl,
      )}${signOffHtml()}`,
    ),
  };
}

export function applicationApprovedEmail(
  recipientName: string | null,
  roomTitle: string,
  homeName: string,
  expiresAt: Date,
) {
  const leaseUrl = `${getSiteUrl()}/account/lease`;
  const deadline = expiresAt.toLocaleString("en-AU");
  const first = firstName(recipientName);
  return {
    subject: "Your application has been approved — sign your lease",
    text: `${greetingText(recipientName)}Congratulations${first ? `, ${first}` : ""}! Your application for ${roomTitle} at ${homeName} has been approved, and we're excited to welcome you to the Venturo community.\n\nTo secure your room, please sign your lease and pay your deposit by ${deadline} — if we don't hear from you by then, the room will unfortunately be released to another applicant.\n\nSign your lease here: ${leaseUrl}\n\nAny questions along the way, just reply to this email or give us a call.${signOffText()}`,
    html: emailShell(
      `${greetingHtml(recipientName)}<p style="margin:0 0 16px;">Congratulations${first ? `, ${escapeHtml(first)}` : ""}! Your application for <strong>${roomTitle}</strong> at ${homeName} has been approved, and we're excited to welcome you to the Venturo community.</p><p style="margin:0;">To secure your room, please sign your lease and pay your deposit by <strong>${deadline}</strong> — if we don't hear from you by then, the room will unfortunately be released to another applicant.</p>${ctaButtonHtml(
        "Sign your lease",
        leaseUrl,
      )}<p style="margin:20px 0 0;">Any questions along the way, just reply to this email or give us a call — we're happy to help.</p>${signOffHtml()}`,
    ),
  };
}

export function leaseExpiredEmail(recipientName: string | null, roomTitle: string, homeName: string) {
  const roomsUrl = `${getSiteUrl()}/rent-a-room`;
  return {
    subject: "Your room reservation has expired",
    text: `${greetingText(recipientName)}We wanted to let you know that your reservation for ${roomTitle} at ${homeName} has expired, as we didn't receive your signed lease and/or deposit in time — so the room has been released back into our listings.\n\nWe know timing doesn't always line up, and we'd love to help you find another place. Browse our current rooms here: ${roomsUrl}${signOffText()}`,
    html: emailShell(
      `${greetingHtml(recipientName)}<p style="margin:0;">We wanted to let you know that your reservation for <strong>${roomTitle}</strong> at ${homeName} has expired, as we didn't receive your signed lease and/or deposit in time — so the room has been released back into our listings.</p><p style="margin:16px 0 0;">We know timing doesn't always line up, and we'd love to help you find another place.</p>${ctaButtonHtml(
        "Browse available rooms",
        roomsUrl,
      )}${signOffHtml()}`,
    ),
  };
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
  const safeAsker = escapeHtml(askerName);
  const safeMessage = escapeHtml(message);
  return {
    subject: `Question about ${roomTitle}`,
    text: `Hi team,\n\n${askerName} asked about ${roomTitle} (${homeName}):\n\n${message}\n\nRoom: ${roomUrl}\nView in admin: ${adminUrl}${signOffText()}`,
    html: emailShell(
      `<p style="margin:0 0 16px;">Hi team,</p><p style="margin:0 0 16px;">${safeAsker} asked about <strong>${roomTitle}</strong> (${homeName}):</p><p style="margin:0 0 16px;">${safeMessage}</p><p style="margin:0 0 4px;"><a href="${roomUrl}" style="color:${BRAND_OLIVE};">${roomUrl}</a></p>${ctaButtonHtml(
        "View in admin",
        adminUrl,
      )}${signOffHtml()}`,
    ),
  };
}

export function applicationRejectedEmail(recipientName: string | null, roomTitle: string, homeName: string) {
  const roomsUrl = `${getSiteUrl()}/rent-a-room`;
  return {
    subject: "Update on your application",
    text: `${greetingText(recipientName)}Thank you for taking the time to apply for ${roomTitle} at ${homeName}. After careful consideration, we've decided not to move forward with your application on this occasion — this isn't a reflection on you personally, we often simply have more strong applicants than rooms available.\n\nWe'd genuinely love to see another application from you whenever you're ready: ${roomsUrl}${signOffText()}`,
    html: emailShell(
      `${greetingHtml(recipientName)}<p style="margin:0;">Thank you for taking the time to apply for <strong>${roomTitle}</strong> at ${homeName}. After careful consideration, we've decided not to move forward with your application on this occasion — this isn't a reflection on you personally, we often simply have more strong applicants than rooms available.</p><p style="margin:16px 0 0;">We'd genuinely love to see another application from you whenever you're ready.</p>${ctaButtonHtml(
        "Browse other rooms",
        roomsUrl,
      )}${signOffHtml()}`,
    ),
  };
}

export function applicationSubmittedEmail(recipientName: string | null, roomTitle: string, homeName: string) {
  return {
    subject: "Your application was submitted successfully",
    text: `${greetingText(recipientName)}Thanks so much for applying for ${roomTitle} at ${homeName} — we've received your application! Our team will review it carefully and get back to you as soon as possible.\n\nIn the meantime, feel free to reach out if you have any questions.${signOffText()}`,
    html: emailShell(
      `${greetingHtml(recipientName)}<p style="margin:0;">Thanks so much for applying for <strong>${roomTitle}</strong> at ${homeName} — we've received your application! Our team will review it carefully and get back to you as soon as possible.</p><p style="margin:16px 0 0;">In the meantime, feel free to reach out if you have any questions.</p>${signOffHtml()}`,
    ),
  };
}

export function newApplicationAdminEmail(
  applicantName: string,
  roomTitle: string,
  homeName: string,
  applicationId: string,
) {
  const adminUrl = `${getSiteUrl()}/admin/applications/${applicationId}`;
  const safeApplicant = escapeHtml(applicantName);
  return {
    subject: `New application from ${applicantName} — ${roomTitle}`,
    text: `Hi team,\n\n${applicantName} submitted an application for ${roomTitle} at ${homeName}.\n\nReview it here: ${adminUrl}${signOffText()}`,
    html: emailShell(
      `<p style="margin:0 0 16px;">Hi team,</p><p style="margin:0;">${safeApplicant} submitted an application for <strong>${roomTitle}</strong> (${homeName}).</p>${ctaButtonHtml(
        "Review application",
        adminUrl,
      )}${signOffHtml()}`,
    ),
  };
}

export function leaseSignedEmail(recipientName: string | null, roomTitle: string, homeName: string) {
  return {
    subject: "Your lease has been signed — welcome to Venturo!",
    text: `${greetingText(recipientName)}We've received your signed lease for ${roomTitle} at ${homeName} — thank you! We're thrilled to have you joining the Venturo community, and we'll be in touch shortly with next steps ahead of your move-in.\n\nIf anything comes up in the meantime, don't hesitate to reach out.${signOffText()}`,
    html: emailShell(
      `${greetingHtml(recipientName)}<p style="margin:0;">We've received your signed lease for <strong>${roomTitle}</strong> at ${homeName} — thank you! We're thrilled to have you joining the Venturo community, and we'll be in touch shortly with next steps ahead of your move-in.</p><p style="margin:16px 0 0;">If anything comes up in the meantime, don't hesitate to reach out.</p>${signOffHtml()}`,
    ),
  };
}

export function leaseSignedAdminEmail(tenantName: string, roomTitle: string, homeName: string, contractId: string) {
  const adminUrl = `${getSiteUrl()}/admin/leases/${contractId}`;
  const safeTenant = escapeHtml(tenantName);
  return {
    subject: `Lease signed by ${tenantName} — ${roomTitle}`,
    text: `Hi team,\n\n${tenantName} signed their lease for ${roomTitle} at ${homeName}.\n\nView it here: ${adminUrl}${signOffText()}`,
    html: emailShell(
      `<p style="margin:0 0 16px;">Hi team,</p><p style="margin:0;">${safeTenant} signed their lease for <strong>${roomTitle}</strong> (${homeName}).</p>${ctaButtonHtml(
        "View lease",
        adminUrl,
      )}${signOffHtml()}`,
    ),
  };
}
