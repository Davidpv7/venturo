export const inputClasses =
  "rounded-md border border-venturo-olive/25 bg-white px-3 py-2.5 text-sm text-foreground placeholder:text-foreground/40 focus:border-venturo-olive/50 focus:outline-none focus:ring-2 focus:ring-venturo-olive/30";

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
      {label}
      {children}
    </label>
  );
}
