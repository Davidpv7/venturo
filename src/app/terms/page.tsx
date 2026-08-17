import { LegalSections } from "@/components/legal/legal-sections";
import { LegalDisclaimer } from "@/components/legal/legal-disclaimer";
import { TERMS_SECTIONS, TERMS_LAST_UPDATED } from "@/lib/legal-content";

export default function TermsPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col px-6 py-16 sm:py-24">
      <div className="rounded-xl border border-venturo-olive/15 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Terms of Service
        </h1>
        <p className="mt-1 text-xs text-foreground/50">Last updated {TERMS_LAST_UPDATED}</p>

        <div className="mt-4">
          <LegalDisclaimer />
        </div>

        <div className="mt-6">
          <LegalSections sections={TERMS_SECTIONS} />
        </div>
      </div>
    </div>
  );
}
