// Indeterminate only — no `value`/`max` props. Byte-level upload progress
// would require a Route Handler + XHR instead of a Server Action, which this
// app deliberately avoids (Server Actions are the only write path).
export function ProgressBar({ className }: { className?: string }) {
  return (
    <div
      role="progressbar"
      aria-label="Uploading"
      className={[
        "h-1.5 w-full overflow-hidden rounded-full bg-venturo-olive/15",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="h-full w-1/3 animate-[progress-indeterminate_1.2s_ease-in-out_infinite] rounded-full bg-venturo-olive" />
    </div>
  );
}
