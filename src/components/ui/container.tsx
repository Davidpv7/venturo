export type ContainerSize = "sm" | "md" | "lg";

// Real size variants for the same reason Button has them — plain Tailwind
// string concatenation (no tailwind-merge installed) can't reliably let a
// className override beat a class already baked into the component.
const maxWidths: Record<ContainerSize, string> = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-6xl",
};

export function Container({
  size = "md",
  className,
  children,
}: {
  size?: ContainerSize;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={["mx-auto px-6", maxWidths[size], className].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
}
