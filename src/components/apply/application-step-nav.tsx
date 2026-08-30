"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { APPLICATION_STEPS, APPLICATION_STEP_LABEL } from "@/lib/application-steps";

export function ApplicationStepNav({ applicationId }: { applicationId: string }) {
  const pathname = usePathname();
  const currentIndex = APPLICATION_STEPS.findIndex(
    (step) => pathname === `/apply/${applicationId}/${step}`,
  );

  return (
    <nav className="shrink-0 sm:w-56">
      {/* Mobile: segmented progress bar instead of a scrolling pill row. */}
      <div className="sm:hidden">
        <ol className="flex items-center gap-1.5">
          {APPLICATION_STEPS.map((step, index) => {
            const href = `/apply/${applicationId}/${step}`;
            const active = index === currentIndex;
            return (
              <li key={step} className="flex-1">
                <Link
                  href={href}
                  aria-label={`${index + 1}. ${APPLICATION_STEP_LABEL[step]}`}
                  aria-current={active ? "step" : undefined}
                  className={[
                    "block h-1.5 rounded-full transition-colors",
                    active ? "bg-venturo-olive" : "bg-venturo-olive/15",
                  ].join(" ")}
                />
              </li>
            );
          })}
        </ol>
        {currentIndex >= 0 && (
          <p className="mt-2 text-sm font-medium text-foreground">
            Step {currentIndex + 1} of {APPLICATION_STEPS.length}:{" "}
            {APPLICATION_STEP_LABEL[APPLICATION_STEPS[currentIndex]]}
          </p>
        )}
      </div>

      {/* Desktop: full vertical sidebar list. */}
      <ol className="hidden text-sm sm:flex sm:flex-col sm:gap-0.5">
        {APPLICATION_STEPS.map((step, index) => {
          const href = `/apply/${applicationId}/${step}`;
          const active = pathname === href;
          return (
            <li key={step}>
              <Link
                href={href}
                className={[
                  "flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 font-medium transition-colors",
                  active
                    ? "bg-venturo-olive/10 text-venturo-olive"
                    : "text-foreground/70 hover:bg-venturo-olive/5 hover:text-venturo-olive",
                ].join(" ")}
              >
                <span className="text-xs text-foreground/40">{index + 1}.</span>
                {APPLICATION_STEP_LABEL[step]}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
