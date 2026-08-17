"use client";

import { ModalTrigger } from "@/components/ui/modal";
import { LegalSections } from "@/components/legal/legal-sections";
import { LegalDisclaimer } from "@/components/legal/legal-disclaimer";
import { TERMS_SECTIONS, PRIVACY_SECTIONS } from "@/lib/legal-content";

const linkClassName = "font-medium text-venturo-olive hover:underline";

// Opens the full text in a modal instead of navigating away — the sign-up
// form (and whatever the user has typed into it) stays intact underneath.
export function TermsModalTrigger() {
  return (
    <ModalTrigger label="Terms of Service" title="Terms of Service" triggerClassName={linkClassName}>
      <div className="flex flex-col gap-4">
        <LegalDisclaimer />
        <LegalSections sections={TERMS_SECTIONS} />
      </div>
    </ModalTrigger>
  );
}

export function PrivacyModalTrigger() {
  return (
    <ModalTrigger label="Privacy Policy" title="Privacy Policy" triggerClassName={linkClassName}>
      <div className="flex flex-col gap-4">
        <LegalDisclaimer />
        <LegalSections sections={PRIVACY_SECTIONS} />
      </div>
    </ModalTrigger>
  );
}
