import Link from "next/link";
import { PencilIcon } from "@/components/ui/icons";

const iconButtonClasses =
  "inline-flex h-8 w-8 items-center justify-center rounded-md text-foreground/50 transition-colors hover:bg-venturo-olive/10 hover:text-venturo-olive cursor-pointer";

export function EditIconLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} aria-label={label} title={label} className={iconButtonClasses}>
      <PencilIcon className="h-4 w-4" />
    </Link>
  );
}
