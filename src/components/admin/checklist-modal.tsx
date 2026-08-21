"use client";

import { useState, useTransition } from "react";
import { ModalTrigger } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { inputClasses } from "@/components/ui/field";
import type { ChecklistItem, ChecklistStage } from "@/generated/prisma/client";

function ChecklistItemRow({
  item,
  toggleAction,
  updateLabelAction,
  deleteAction,
}: {
  item: ChecklistItem;
  toggleAction: (formData: FormData) => void | Promise<void>;
  updateLabelAction: (formData: FormData) => void | Promise<void>;
  deleteAction: (formData: FormData) => void | Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [draftLabel, setDraftLabel] = useState(item.label);

  function handleToggle(checked: boolean) {
    const formData = new FormData();
    formData.set("itemId", item.id);
    formData.set("completed", checked ? "true" : "false");
    startTransition(() => {
      toggleAction(formData);
    });
  }

  function handleDelete() {
    if (!window.confirm(`Remove "${item.label}" from the checklist?`)) return;
    const formData = new FormData();
    formData.set("itemId", item.id);
    startTransition(() => {
      deleteAction(formData);
    });
  }

  function handleSaveLabel() {
    const trimmed = draftLabel.trim();
    if (!trimmed || trimmed === item.label) {
      setDraftLabel(item.label);
      setIsEditing(false);
      return;
    }

    const formData = new FormData();
    formData.set("itemId", item.id);
    formData.set("label", trimmed);
    startTransition(async () => {
      await updateLabelAction(formData);
      setIsEditing(false);
    });
  }

  if (isEditing) {
    return (
      <li className="flex items-center gap-2 text-sm">
        <input
          type="text"
          value={draftLabel}
          onChange={(e) => setDraftLabel(e.target.value)}
          disabled={isPending}
          autoFocus
          className={`${inputClasses} flex-1 py-1 text-sm`}
        />
        <button
          type="button"
          onClick={handleSaveLabel}
          disabled={isPending}
          className="shrink-0 text-xs font-medium text-venturo-olive hover:underline disabled:opacity-50"
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => {
            setDraftLabel(item.label);
            setIsEditing(false);
          }}
          disabled={isPending}
          className="shrink-0 text-xs text-foreground/50 hover:underline disabled:opacity-50"
        >
          Cancel
        </button>
      </li>
    );
  }

  return (
    <li className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={item.completed}
        disabled={isPending}
        onChange={(e) => handleToggle(e.target.checked)}
        className="h-4 w-4 shrink-0 cursor-pointer rounded border-foreground/25 text-venturo-olive focus:ring-venturo-olive disabled:opacity-50"
      />
      <span
        className={`flex-1 ${item.completed ? "text-foreground/60 line-through" : "text-foreground"}`}
      >
        {item.label}
      </span>
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        disabled={isPending}
        className="shrink-0 text-xs text-foreground/40 hover:text-foreground hover:underline disabled:opacity-50"
      >
        Edit
      </button>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="shrink-0 text-xs text-red-500/70 hover:text-red-600 hover:underline disabled:opacity-50"
      >
        Delete
      </button>
    </li>
  );
}

function AddChecklistItemForm({
  contractId,
  stage,
  createAction,
}: {
  contractId: string;
  stage: ChecklistStage;
  createAction: (formData: FormData) => void | Promise<void>;
}) {
  const [label, setLabel] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = label.trim();
    if (!trimmed) return;

    const formData = new FormData();
    formData.set("contractId", contractId);
    formData.set("stage", stage);
    formData.set("label", trimmed);
    startTransition(async () => {
      await createAction(formData);
      setLabel("");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 flex items-center gap-2">
      <input
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Add an item…"
        disabled={isPending}
        className={`${inputClasses} flex-1 py-1.5 text-sm`}
      />
      <Button type="submit" size="sm" disabled={isPending || !label.trim()}>
        Add
      </Button>
    </form>
  );
}

function ChecklistItemGroup({
  title,
  stage,
  items,
  contractId,
  toggleAction,
  updateLabelAction,
  createAction,
  deleteAction,
}: {
  title: string;
  stage: ChecklistStage;
  items: ChecklistItem[];
  contractId: string;
  toggleAction: (formData: FormData) => void | Promise<void>;
  updateLabelAction: (formData: FormData) => void | Promise<void>;
  createAction: (formData: FormData) => void | Promise<void>;
  deleteAction: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <div>
      <h3 className="text-sm font-medium text-foreground/70">{title}</h3>
      {items.length > 0 && (
        <ul className="mt-2 flex flex-col gap-1.5">
          {items.map((item) => (
            <ChecklistItemRow
              key={item.id}
              item={item}
              toggleAction={toggleAction}
              updateLabelAction={updateLabelAction}
              deleteAction={deleteAction}
            />
          ))}
        </ul>
      )}
      <AddChecklistItemForm contractId={contractId} stage={stage} createAction={createAction} />
    </div>
  );
}

export function ChecklistModal({
  tenantName,
  contractId,
  items,
  toggleAction,
  createAction,
  updateLabelAction,
  deleteAction,
  triggerClassName,
}: {
  tenantName: string;
  contractId: string;
  items: ChecklistItem[];
  toggleAction: (formData: FormData) => void | Promise<void>;
  createAction: (formData: FormData) => void | Promise<void>;
  updateLabelAction: (formData: FormData) => void | Promise<void>;
  deleteAction: (formData: FormData) => void | Promise<void>;
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
        Changes here show up immediately on the tenant&apos;s My Stay page.
      </p>
      <div className="mt-4 flex flex-col gap-5">
        <ChecklistItemGroup
          title="Move-in"
          stage="MOVE_IN"
          items={moveInItems}
          contractId={contractId}
          toggleAction={toggleAction}
          updateLabelAction={updateLabelAction}
          createAction={createAction}
          deleteAction={deleteAction}
        />
        <ChecklistItemGroup
          title="Move-out"
          stage="MOVE_OUT"
          items={moveOutItems}
          contractId={contractId}
          toggleAction={toggleAction}
          updateLabelAction={updateLabelAction}
          createAction={createAction}
          deleteAction={deleteAction}
        />
      </div>
    </ModalTrigger>
  );
}
