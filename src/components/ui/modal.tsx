"use client";

import { useRef, type ReactNode } from "react";

// Native <dialog> gives us focus-trapping, ESC-to-close and a backdrop for
// free. Tailwind's preflight resets `margin: 0` on every element, which
// overrides the UA stylesheet's `margin: auto` centering for dialog:modal —
// `m-auto` below puts that back explicitly rather than relying on it.
export function ModalTrigger({
  label,
  title,
  triggerClassName,
  children,
}: {
  label: string;
  title: string;
  triggerClassName?: string;
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  function closeOnBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickedOutside =
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom;
    if (clickedOutside) e.currentTarget.close();
  }

  return (
    <>
      <button
        type="button"
        className={triggerClassName}
        onClick={() => dialogRef.current?.showModal()}
      >
        {label}
      </button>
      <dialog
        ref={dialogRef}
        onClick={closeOnBackdropClick}
        className="m-auto max-h-[85vh] w-[calc(100%-2rem)] max-w-lg rounded-xl border border-venturo-olive/15 bg-white p-0 shadow-lg backdrop:bg-black/40"
      >
        <div className="flex items-center justify-between border-b border-venturo-olive/10 px-6 py-4">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Close"
            className="cursor-pointer text-xl leading-none text-foreground/40 hover:text-foreground"
          >
            &times;
          </button>
        </div>
        <div className="max-h-[calc(85vh-4.5rem)] overflow-y-auto px-6 py-5">{children}</div>
      </dialog>
    </>
  );
}
