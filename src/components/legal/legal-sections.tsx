import type { LegalSection } from "@/lib/legal-content";

export function LegalSections({ sections }: { sections: LegalSection[] }) {
  return (
    <div className="flex flex-col gap-5">
      {sections.map((section) => (
        <section key={section.heading}>
          <h3 className="text-sm font-semibold text-foreground">{section.heading}</h3>
          {section.body.map((paragraph, i) => (
            <p key={i} className="mt-1.5 text-sm leading-relaxed text-foreground/70">
              {paragraph}
            </p>
          ))}
        </section>
      ))}
    </div>
  );
}
