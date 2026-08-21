"use client";

import { useTransition } from "react";
import { ModalTrigger } from "@/components/ui/modal";
import type { ChecklistItem } from "@/generated/prisma/client";

function ChecklistItemRow({
  item,
  toggleAction,
}: {
  item: ChecklistItem;
  toggleAction: (formData: FormData) => void | Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();

  function handleChange(checked: boolean) {
    const formData = new FormData();
    formData.set("itemId", item.id);
    formData.set("completed", checked ? "true" : "false");
    startTransition(() => {
      toggleAction(formData);
    });
  }

  return (
    <li className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={item.completed}
        disabled={isPending}
        onChange={(e) => handleChange(e.target.checked)}
        className="h-4 w-4 shrink-0 cursor-pointer rounded border-foreground/25 text-venturo-olive focus:ring-venturo-olive disabled:opacity-50"
      />
      <span className={item.completed ? "text-foreground/60 line-through" : "text-foreground"}>
        {item.label}
      </span>
    </li>
  );
}

function ChecklistItemGroup({
  title,
  items,
  toggleAction,
}: {
  title: string;
  items: ChecklistItem[];
  toggleAction: (formData: FormData) => void | Promise<void>;
}) {
  if (items.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-medium text-foreground/70">{title}</h3>
      <ul className="mt-2 flex flex-col gap-1.5">
        {items.map((item) => (
          <ChecklistItemRow key={item.id} item={item} toggleAction={toggleAction} />
        ))}
      </ul>
    </div>
  );
}

export function ChecklistModal({
  tenantName,
  items,
  toggleAction,
  triggerClassName,
}: {
  tenantName: string;
  items: ChecklistItem[];
  toggleAction: (formData: FormData) => void | Promise<void>;
  triggerClassName?: string;
}) {
  const moveInItems = items.filter((item) => item.stage === "MOVE_IN");
  const moveOutItems = items.filter((item) => item.stage === "MOVE_OUT");

  return (
    <ModalTrigger
      label="Move-in / Move-out Checklist"
      title={`${tenantName}'s checklist`}
      triggerClassName={triggerClassName}
    >
      <p className="text-sm text-foreground/60">
        Ticking an item here updates it immediately on the tenant&apos;s My Stay page.
      </p>
      <div className="mt-4 flex flex-col gap-4">
        <ChecklistItemGroup title="Move-in" items={moveInItems} toggleAction={toggleAction} />
        <ChecklistItemGroup title="Move-out" items={moveOutItems} toggleAction={toggleAction} />
      </div>
    </ModalTrigger>
  );
}
