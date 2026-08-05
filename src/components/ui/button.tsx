import Link from "next/link";
import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-venturo-olive/40 focus-visible:ring-offset-2 focus-visible:ring-offset-venturo-cream disabled:pointer-events-none disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-venturo-olive text-white shadow-sm hover:bg-venturo-olive/90",
  secondary:
    "border border-venturo-olive/30 text-venturo-olive hover:bg-venturo-olive/5",
};

// Real size variants rather than letting callers pass ad-hoc `className`
// padding overrides — plain Tailwind string concatenation (no tailwind-merge
// installed) can't reliably guarantee a later class wins over an earlier one
// of the same property, so "shrink this button via className" is a trap.
const sizes: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

function buttonClasses(variant: ButtonVariant, size: ButtonSize, className?: string) {
  return [base, variants[variant], sizes[size], className].filter(Boolean).join(" ");
}

// For form-submit buttons and other in-page actions.
export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={buttonClasses(variant, size, className)} {...props} />;
}

// For navigational buttons styled the same way (Next.js Link, not <a>, so
// client-side navigation still applies).
export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  href,
  ...props
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
} & React.ComponentProps<typeof Link>) {
  return (
    <Link href={href} className={buttonClasses(variant, size, className)} {...props} />
  );
}
