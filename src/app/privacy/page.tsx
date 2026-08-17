import { LegalSections } from "@/components/legal/legal-sections";
import { LegalDisclaimer } from "@/components/legal/legal-disclaimer";
import { PRIVACY_SECTIONS, PRIVACY_LAST_UPDATED } from "@/lib/legal-content";

export default function PrivacyPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col px-6 py-16 sm:py-24">
      <div className="rounded-xl border border-venturo-olive/15 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Privacy Policy</h1>
        <p className="mt-1 text-xs text-foreground/50">Last updated {PRIVACY_LAST_UPDATED}</p>

        <div className="mt-4">
          <LegalDisclaimer />
        </div>

        <div className="mt-6">
          <LegalSections sections={PRIVACY_SECTIONS} />
        </div>
      </div>
    </div>
  );
}
