export type LegalSection = { heading: string; body: string[] };

// Placeholder copy — modelled on the structure common to Australian
// room-rental/property sites and the Privacy Act 1988 (Cth) / Australian
// Privacy Principles, but not drafted or reviewed by a lawyer. Replace with
// Venturo's actual reviewed Terms before this app goes live (see
// CONTRACT_VERSION's own placeholder note in
// src/app/rent-a-room/[homeId]/[roomId]/actions.ts for the same caveat
// applied to the lease contract itself).
export const TERMS_LAST_UPDATED = "17 August 2026";

export const TERMS_SECTIONS: LegalSection[] = [
  {
    heading: "1. Acceptance of these terms",
    body: [
      'By creating an account, browsing rooms, registering interest, or applying to rent a room through Venturo ("Venturo", "we", "us", "our"), you agree to be bound by these Terms of Service. If you do not agree, please don’t use the platform.',
    ],
  },
  {
    heading: "2. About Venturo",
    body: [
      "Venturo operates co-living homes and rooms available for rent in Australia. Listings, availability and pricing shown on the platform are indicative and may change until a contract is signed and a deposit is confirmed by our team.",
    ],
  },
  {
    heading: "3. Eligibility & your account",
    body: [
      "You must be at least 18 years old and capable of entering a legally binding lease under Australian law to create an account.",
      "You agree to provide accurate, current and complete information when signing up and applying, and to keep your account details up to date from your profile.",
      "You're responsible for keeping your login credentials secure and for all activity under your account.",
    ],
  },
  {
    heading: "4. Rental applications",
    body: [
      "Registering interest in a room doesn't guarantee availability or approval. Submitting an application requires supporting information — identity, income/employment, rental history and references — which we use solely to assess it, consistent with our Privacy Policy.",
      "We may decline an application at our discretion, including where information provided can't be verified.",
    ],
  },
  {
    heading: "5. Contracts, deposits & fees",
    body: [
      "A tenancy only becomes binding once you sign a contract through the platform and we confirm receipt of the associated deposit. Rent and other charges are shown in Australian dollars and invoiced through your account.",
      "Deposits and rent are non-refundable except as required by applicable residential tenancy law or expressly agreed in your contract.",
    ],
  },
  {
    heading: "6. Your conduct",
    body: [
      "You agree not to misuse the platform — including submitting false information, impersonating someone else, or trying to get around our verification or payment processes — and to communicate respectfully with Venturo staff and other residents.",
    ],
  },
  {
    heading: "7. Suspension & termination",
    body: [
      "We may suspend or close your account if you breach these Terms, provide false information, or where we reasonably believe it's necessary to protect Venturo, other users, or our properties. You can close your account at any time by contacting us.",
    ],
  },
  {
    heading: "8. Disclaimers & liability",
    body: [
      'The platform and listings are provided "as is." To the extent permitted by the Australian Consumer Law and other applicable law, Venturo isn’t liable for indirect or consequential loss arising from your use of the platform. Nothing here excludes any guarantee, right or remedy you have under the Australian Consumer Law that can’t lawfully be excluded.',
    ],
  },
  {
    heading: "9. Governing law",
    body: [
      "These Terms are governed by the laws of the State/Territory in which Venturo operates, Australia, and any dispute is subject to the non-exclusive jurisdiction of that State/Territory's courts.",
    ],
  },
  {
    heading: "10. Changes to these terms",
    body: [
      "We may update these Terms from time to time. Continuing to use the platform after a change takes effect means you accept the updated Terms.",
    ],
  },
  {
    heading: "11. Contact us",
    body: ["Questions about these Terms can be sent to legal@venturo.example."],
  },
];

export const PRIVACY_LAST_UPDATED = "17 August 2026";

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    heading: "1. Our commitment to your privacy",
    body: [
      "Venturo is committed to protecting your personal information in line with the Privacy Act 1988 (Cth) and the Australian Privacy Principles (APPs).",
    ],
  },
  {
    heading: "2. Personal information we collect",
    body: [
      "Account details: your full name, email address and password.",
      "Application details, only if you apply to rent a room: date of birth, phone number, current address, employment and income information, rental history and references, and any identity or visa documents you upload.",
      "Technical information: IP address and basic usage data collected automatically while you use the platform.",
    ],
  },
  {
    heading: "3. Sensitive information",
    body: [
      "We don't seek to collect sensitive information (such as health or criminal history) unless you provide it voluntarily or we're required to by law, and only with your consent where the APPs require it.",
    ],
  },
  {
    heading: "4. How we collect your information",
    body: [
      "Directly from you — when you create an account, apply for a room, or contact us — and automatically through cookies and similar technologies while you use the platform.",
    ],
  },
  {
    heading: "5. Why we collect and use it",
    body: [
      "To create and manage your account, assess rental applications, administer contracts, deposits and invoices, verify your identity, communicate with you about your tenancy, and meet our legal obligations.",
    ],
  },
  {
    heading: "6. Who we may disclose it to",
    body: [
      "Venturo staff involved in managing homes and applications; the referees and employers you nominate, for verification; our hosting and infrastructure providers (Supabase, Vercel); and government or regulatory bodies where required by law. We don't sell your personal information.",
    ],
  },
  {
    heading: "7. Storage & security",
    body: [
      "Your information is stored in a Postgres database hosted by Supabase, with identity documents kept in a private storage bucket accessible only to authorised Venturo staff. We take reasonable technical and organisational steps to protect it, though no method of transmission or storage is completely secure.",
    ],
  },
  {
    heading: "8. Overseas storage",
    body: [
      "Our hosting providers may store or process data on servers located outside Australia. Where this happens, we take reasonable steps to ensure your information continues to be handled in line with the APPs.",
    ],
  },
  {
    heading: "9. Retention & deletion",
    body: [
      "We keep your account information for as long as your account is active. If a rental application is rejected, we retain it for 60 days so you can query the outcome, after which it's automatically deleted.",
    ],
  },
  {
    heading: "10. Access & correction",
    body: [
      "You can review and update most of your personal information at any time from your account profile. To request a copy of your information or ask us to correct it, contact us using the details below.",
    ],
  },
  {
    heading: "11. Complaints",
    body: [
      "If you have a concern about how we've handled your personal information, contact us first so we can try to resolve it. If you're not satisfied with our response, you can lodge a complaint with the Office of the Australian Information Commissioner (OAIC) at oaic.gov.au.",
    ],
  },
  {
    heading: "12. Changes to this policy",
    body: [
      "We may update this Privacy Policy from time to time. The date at the top of this page reflects the version currently in effect.",
    ],
  },
  {
    heading: "13. Contact us",
    body: ["Privacy questions or requests can be sent to privacy@venturo.example."],
  },
];
