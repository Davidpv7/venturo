"use client";

import { useFormStatus } from "react-dom";
import { Button, type ButtonSize, type ButtonVariant } from "@/components/ui/button";
import type { ButtonHTMLAttributes } from "react";

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z"
      />
    </svg>
  );
}

// Submit button for a `<form action={...}>` server action — shows a spinner
// and swaps its label while the action is in flight, via useFormStatus
// (requires this component to render inside the <form>, not the page).
export function SubmitButton({
  children,
  pendingText,
  variant = "primary",
  size = "md",
  className,
  ...props
}: {
  children: React.ReactNode;
  pendingText?: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      className={className}
      disabled={pending}
      {...props}
    >
      {pending && <Spinner />}
      <span className={pending ? "ml-2" : undefined}>{pending ? (pendingText ?? children) : children}</span>
    </Button>
  );
}
