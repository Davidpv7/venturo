"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { APPLICATION_STEPS, APPLICATION_STEP_LABEL } from "@/lib/application-steps";

function CheckIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path
        d="M3.5 8.5L6.5 11.5L12.5 4.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ApplicationStepNav({ applicationId }: { applicationId: string }) {
  const pathname = usePathname();
  const currentIndex = APPLICATION_STEPS.findIndex(
    (step) => pathname === `/apply/${applicationId}/${step}`,
  );

  return (
    <nav className="shrink-0 sm:w-56">
      {/* Mobile: clickable numbered stepper instead of a scrolling pill row. */}
      <div className="sm:hidden">
        <ol className="flex items-center">
          {APPLICATION_STEPS.map((step, index) => {
            const href = `/apply/${applicationId}/${step}`;
            const active = index === currentIndex;
            const completed = currentIndex >= 0 && index < currentIndex;
            const isLast = index === APPLICATION_STEPS.length - 1;
            return (
              <li key={step} className="flex flex-1 items-center last:flex-none">
                <Link
                  href={href}
                  aria-label={`${index + 1}. ${APPLICATION_STEP_LABEL[step]}`}
                  aria-current={active ? "step" : undefined}
                  className={[
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                    active
                      ? "bg-venturo-olive text-white ring-2 ring-venturo-olive/30 ring-offset-2 ring-offset-venturo-cream"
                      : completed
                        ? "bg-venturo-olive/80 text-white hover:bg-venturo-olive"
                        : "bg-venturo-olive/15 text-venturo-olive/70 hover:bg-venturo-olive/25",
                  ].join(" ")}
                >
                  {completed ? <CheckIcon className="h-4 w-4 text-black" /> : index + 1}
                </Link>
                {!isLast && (
                  <span
                    aria-hidden="true"
                    className={[
                      "mx-1 h-1 flex-1 rounded-full transition-colors",
                      completed ? "bg-venturo-olive/80" : "bg-venturo-olive/15",
                    ].join(" ")}
                  />
                )}
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
        <p className="mt-0.5 text-xs text-foreground/50">Tap a step to jump to it.</p>
      </div>

      {/* Desktop: full vertical sidebar list. */}
      <ol className="hidden text-sm sm:flex sm:flex-col sm:gap-0.5">
        {APPLICATION_STEPS.map((step, index) => {
          const href = `/apply/${applicationId}/${step}`;
          const active = pathname === href;
          const completed = currentIndex >= 0 && index < currentIndex;
          return (
            <li key={step}>
              <Link
                href={href}
                aria-current={active ? "step" : undefined}
                className={[
                  "flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 font-medium transition-colors",
                  active
                    ? "bg-venturo-olive/10 text-venturo-olive"
                    : "text-foreground/70 hover:bg-venturo-olive/5 hover:text-venturo-olive",
                ].join(" ")}
              >
                <span
                  className={[
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                    completed
                      ? "bg-venturo-olive/80 text-white"
                      : active
                        ? "bg-venturo-olive text-white"
                        : "bg-venturo-olive/15 text-foreground/40",
                  ].join(" ")}
                >
                  {completed ? <CheckIcon className="h-3.5 w-3.5 text-black" /> : index + 1}
                </span>
                {APPLICATION_STEP_LABEL[step]}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
