"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { APPLICATION_STEPS, APPLICATION_STEP_LABEL } from "@/lib/application-steps";

export function ApplicationStepNav({ applicationId }: { applicationId: string }) {
  const pathname = usePathname();

  return (
    <nav className="shrink-0 sm:w-56">
      <ol className="flex gap-1 overflow-x-auto text-sm sm:flex-col sm:gap-0.5">
        {APPLICATION_STEPS.map((step, index) => {
          const href = `/apply/${applicationId}/${step}`;
          const active = pathname === href;
          return (
            <li key={step} className="shrink-0 sm:shrink">
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
