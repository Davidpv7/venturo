export const inputClasses =
  "rounded-md border border-venturo-olive/25 bg-white px-3 py-2.5 text-sm text-foreground placeholder:text-foreground/40 focus:border-venturo-olive/50 focus:outline-none focus:ring-2 focus:ring-venturo-olive/30";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
      {label}
      {children}
      {hint ? <span className="text-xs font-normal text-foreground/50">{hint}</span> : null}
    </label>
  );
}

export const MARKDOWN_HINT =
  "Supports formatting: **bold**, _italic_, ~~strikethrough~~, - bullet lists, 1. numbered lists, [link](https://...)";
