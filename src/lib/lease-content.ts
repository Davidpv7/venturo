// The Co-Living Residential Sublease Agreement's fixed boilerplate —
// identical for every tenant, no data merge needed. Structured similarly to
// legal-content.ts's LegalSection pattern, but as label/value rows where the
// source document itself is a table (house rules, maintenance, keys,
// breach/termination, Schedule E), and prose paragraphs where it isn't.
//
// This is the placeholder text of Venturo's actual reviewed lease template
// (see LEASE_VERSION below) — not drafted or reviewed by a lawyer. Replace
// with the real agreement before this app goes live, same caveat as
// legal-content.ts's Terms/Privacy placeholders.

export type LeaseProseSection = { heading: string; body: string[] };
export type LeaseRuleSection = { heading: string; rows: { area: string; detail: string }[] };

// Ties a signed lease to the version of this document's text that was in
// effect at signing time — Contract.contractVersion is set to this at
// approval. Previously a local placeholder const in
// src/app/admin/applications/actions.ts; moved here since this is precisely
// what it versions.
export const LEASE_VERSION = "v1.0";
export const LEASE_LAST_UPDATED = "28 August 2026";

// Venturo's own business details as sublessor — a fixed legal-entity fact,
// not admin-editable operational data (unlike PaymentSettings.bankDetails,
// which changes with the actual bank account in use).
export const HEAD_TENANT = {
  name: "Valeria Antonucci",
  abn: "86 237 914 194",
  phone: "0434 582 864",
  email: "venturo.coliving@gmail.com",
};

export const EMERGENCY_NUMBERS = {
  policeFireAmbulance: "000",
  ses: "132 500",
  alternativeContact: "0432 602 876",
};

export const LEASE_PROSE_SECTIONS: LeaseProseSection[] = [
  {
    heading: "2. Nature of Agreement & Term",
    body: [
      "This is a residential sublease between the Head Tenant and Resident. The Head Tenant is not the owner and the Property is occupied under a head tenancy. This Agreement is subject to that head tenancy and applicable NSW law. The Resident acquires no greater rights than the Head Tenant.",
      "If no end date is inserted, the tenancy continues as a periodic tenancy until lawfully terminated. Nothing in this Agreement excludes rights that cannot lawfully be excluded under the Residential Tenancies Act 2010 (NSW).",
    ],
  },
  {
    heading: "3. Rent, Bond & Utilities",
    body: [
      "Rent must be received by 11:59pm on the due date. Where utilities are not included, the Resident pays their allocated share as notified by the Head Tenant; invoices are payable within 7 days unless otherwise agreed.",
      "The bond may be used, where permitted by law, for unpaid rent, damage beyond fair wear and tear, missing inventory, necessary cleaning, lost keys/access devices, unpaid utilities and other lawful amounts. An itemised statement will be provided for deductions.",
      "Responsible Electricity Use: Residents are expected to use electricity reasonably and responsibly. Unnecessary or excessive electricity consumption should be avoided. Residents should switch off lights, appliances, heating, cooling and other electrical devices when not required and when leaving the Property.",
    ],
  },
  {
    heading: "7. Internet, Privacy & Insurance",
    body: [
      "Where internet is provided, the Resident must not use it unlawfully, hack/interfere with the network, operate servers without permission or materially disrupt other residents' access. Internet service is not guaranteed.",
      "Personal information may be collected and used for tenancy management, communication, maintenance, emergencies and legal compliance. Disclosure is limited to lawful requirements, reasonably necessary contractors, or the Resident's consent.",
      "The Head Tenant's insurance, if any, does not generally cover the Resident's belongings. Residents are encouraged to obtain contents insurance.",
    ],
  },
  {
    heading: "9. Notices, Disputes & Legal Terms",
    body: [
      "Notices may be given by hand, post, email or another agreed method where permitted by NSW law. Both parties should promptly update contact details.",
      "The parties will make reasonable efforts to resolve disputes through discussion before formal proceedings. Either party may use available NSW tenancy dispute processes, including NCAT where appropriate.",
      "This Agreement and its schedules form the entire agreement. Variations must be in writing and signed unless otherwise permitted by law. If any provision is invalid, the remainder continues to the extent permitted by law. NSW law governs this Agreement. Electronic signatures may be used to the extent permitted by law.",
    ],
  },
];

export const LEASE_RULE_SECTIONS: LeaseRuleSection[] = [
  {
    heading: "4. Resident Conduct & House Rules",
    rows: [
      { area: "Respect", detail: "Be respectful. No harassment, bullying, discrimination, threats, intimidation or abusive behaviour." },
      { area: "Quiet hours", detail: "Sun–Thu: 10pm–7am. Fri–Sat: 11pm–8am. Keep noise low; use headphones where practical; avoid noisy appliances and slamming doors." },
      { area: "Guests", detail: "Resident is responsible for guests. Guests must follow the Agreement/House Rules and may use common areas only while accompanied. No keys, codes or access devices may be given to guests." },
      { area: "Overnight guests", detail: "Without prior written approval: max. 2 consecutive nights and 6 nights per calendar month. Longer stays may be treated as unauthorised occupancy." },
      { area: "Occupancy", detail: "Only named Residents may live at the Property. No subletting, advertising the room, permanent occupants or accepting accommodation payments from others." },
      { area: "Kitchen", detail: "Clean immediately after use; wash dishes; wipe surfaces/stovetop; remove expired food; respect pantry/fridge allocations." },
      { area: "Bathroom", detail: "Leave clean after use; do not block drains; report leaks promptly. Damage from improper use may be charged where lawful." },
      { area: "Laundry", detail: "Remove clothes promptly; clean dryer lint filter; avoid unnecessary use during quiet hours." },
      { area: "Cleaning", detail: "Keep bedroom, allocated storage, bathroom after use and shared areas clean. Professional cleaning does not remove the Resident's obligation to clean between services." },
      { area: "Rubbish", detail: "Use bins correctly, recycle properly, avoid overflowing bins and follow any bin roster." },
      { area: "Smoking/vaping", detail: "Prohibited inside the dwelling, bedrooms, bathrooms, hallways, stairwells and indoor common areas. Only permitted in a designated outdoor area, if any, without unreasonably affecting others." },
      { area: "Alcohol", detail: "Responsible consumption permitted provided it does not disturb others, create excessive noise, damage property or involve illegal conduct." },
      { area: "Illegal activity", detail: "Illegal drugs and unlawful activity are prohibited." },
      { area: "Weapons", detail: "Firearms, prohibited weapons, explosives and dangerous materials are prohibited except where lawfully possessed and expressly approved in writing where appropriate." },
      { area: "Pets", detail: "Prior written approval required and may be subject to reasonable conditions." },
      { area: "Parking/storage", detail: "Only allocated parking may be used. No blocking driveways, unregistered vehicles or vehicle repairs. Store belongings only in the bedroom or allocated storage." },
      { area: "Mail/deliveries", detail: "Resident must collect mail and deliveries promptly. Head Tenant is not responsible for loss/theft unless caused by negligence." },
    ],
  },
  {
    heading: "5. Maintenance, Damage & Property Care",
    rows: [
      { area: "Care for Property", detail: "Keep rooms/shared areas reasonably clean; take reasonable care of furniture, appliances and fixtures." },
      { area: "Report issues", detail: "Promptly report damage, faults, leaks and maintenance issues by email, SMS or designated app. Provide photos/details where practical." },
      { area: "Emergency repairs", detail: "Immediately report burst pipes, major leaks, gas leaks, electrical faults, fire damage, flooding, loss of essential services or security breaches. Take reasonable safe steps to limit further damage." },
      { area: "Damage", detail: "Resident is responsible for damage caused by themselves, guests or people they allow onto the Property. Fair wear and tear is excluded." },
      { area: "Alterations", detail: "No painting, drilling, shelving, lock replacement, smart devices, TV mounting, furniture modification or removal of supplied furniture without prior written consent." },
      { area: "Inventory", detail: "Schedule C forms part of this Agreement. Items must be returned at the end of the tenancy, allowing for fair wear and tear." },
    ],
  },
  {
    heading: "6. Keys, Security & Access",
    rows: [
      { area: "Resident obligations", detail: "Do not copy/lend keys or access devices or alter locks without written permission. Report lost keys immediately. Keep doors/windows locked, alarm codes confidential, and do not disable smoke alarms or tamper with security devices." },
      { area: "Access", detail: "Head Tenant may enter only with consent, required notice, for repairs/inspections, in an emergency or otherwise as permitted by law. Bedroom entry will respect privacy and notice requirements." },
    ],
  },
  {
    heading: "8. Breach, Termination & Vacating",
    rows: [
      { area: "Breach", detail: "A party should notify the other in writing of a breach and, where appropriate, allow a reasonable period to remedy it. Serious or persistent breaches may lead to lawful termination." },
      { area: "Ending", detail: "Agreement may end by expiry of fixed term, mutual written agreement, lawful notice, termination under the Residential Tenancies Act 2010 (NSW), or NCAT order where applicable." },
      { area: "Before vacating", detail: "Remove belongings; return keys/access devices/remotes; leave bedroom and shared areas reasonably clean; remove rubbish; return furniture/inventory; provide forwarding address for bond correspondence." },
      { area: "Bond deductions", detail: "Where lawful: unpaid rent, necessary cleaning, damage beyond fair wear and tear, missing inventory, keys/access devices, utilities and other lawful claims." },
      { area: "Indemnity", detail: "To the extent permitted by law, Resident is responsible for loss/damage arising from their breach or negligent/unlawful acts, including those of guests." },
    ],
  },
  {
    heading: "Schedule E — House Rules (Quick Reference)",
    rows: [
      { area: "Respect", detail: "Treat everyone politely; no harassment, bullying, discrimination or abuse." },
      { area: "Noise", detail: "Follow quiet hours; use headphones where practical; keep late-night calls/private noise low." },
      { area: "Kitchen", detail: "Clean immediately; no dirty dishes overnight; remove expired food." },
      { area: "Bathroom", detail: "Leave clean; don't block drains; report leaks." },
      { area: "Laundry", detail: "Remove clothes promptly; clean lint filter." },
      { area: "Visitors", detail: "Welcome if respectful; Resident remains responsible." },
      { area: "Security", detail: "Lock doors; don't share codes/keys; report lost keys." },
      { area: "Smoking", detail: "No smoking/vaping inside." },
      { area: "Illegal activity", detail: "Strictly prohibited." },
      { area: "Rubbish", detail: "Dispose promptly and recycle correctly." },
      { area: "Shared property", detail: "Treat furniture/appliances with care; report damage." },
      { area: "Internet", detail: "No unlawful use or material interference with others." },
      { area: "Emergencies", detail: "Immediately report gas leaks, flooding, electrical faults, burst pipes and fire." },
    ],
  },
];

// Schedule C — single fixed furniture list for every room. Flagged
// simplification for this single-property MVP: if a second Home with
// materially different furniture is added later, this needs to become
// Home-scoped content rather than a hardcoded constant.
export const SCHEDULE_C_FURNITURE: { area: string; items: string }[] = [
  { area: "Kitchen", items: "Utensils, Pots and pans, Cutlery and dishes, Fridge, Microwave and Kettle." },
  { area: "Laundry", items: "Washing Machine, Dryer, Vacuum, Iron board, Iron." },
  { area: "Living Area", items: "Sofa, Television, TV Remote, Rug." },
];
