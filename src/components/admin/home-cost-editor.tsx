"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { inputClasses } from "@/components/ui/field";
import { formatCurrency } from "@/lib/format";

export function HomeCostEditor({
  homeId,
  weeklyCostCents,
  weeklyServiceCostCents,
  updateAction,
}: {
  homeId: string;
  weeklyCostCents: number | null;
  weeklyServiceCostCents: number | null;
  updateAction: (formData: FormData) => void | Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [draftCost, setDraftCost] = useState(
    weeklyCostCents !== null ? String(weeklyCostCents / 100) : "",
  );
  const [draftServiceCost, setDraftServiceCost] = useState(
    weeklyServiceCostCents !== null ? String(weeklyServiceCostCents / 100) : "",
  );

  function handleSave() {
    const formData = new FormData();
    formData.set("homeId", homeId);
    formData.set("weeklyCost", draftCost);
    formData.set("weeklyServiceCost", draftServiceCost);
    startTransition(async () => {
      await updateAction(formData);
      setIsEditing(false);
    });
  }

  function handleCancel() {
    setDraftCost(weeklyCostCents !== null ? String(weeklyCostCents / 100) : "");
    setDraftServiceCost(
      weeklyServiceCostCents !== null ? String(weeklyServiceCostCents / 100) : "",
    );
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <div className="mt-4 flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
          Weekly house cost (AUD)
          <input
            type="number"
            step="0.01"
            min="0"
            value={draftCost}
            onChange={(e) => setDraftCost(e.target.value)}
            disabled={isPending}
            autoFocus
            className={`${inputClasses} w-36 py-1.5`}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
          Weekly services estimate (AUD)
          <input
            type="number"
            step="0.01"
            min="0"
            value={draftServiceCost}
            onChange={(e) => setDraftServiceCost(e.target.value)}
            disabled={isPending}
            className={`${inputClasses} w-36 py-1.5`}
          />
        </label>
        <Button type="button" size="sm" onClick={handleSave} disabled={isPending}>
          Save
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleCancel}
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-6 text-sm">
      <div>
        <span className="text-foreground/50">Weekly house cost: </span>
        <span className="font-medium text-foreground">
          {weeklyCostCents !== null ? `${formatCurrency(weeklyCostCents)}/week` : "Not set"}
        </span>
      </div>
      <div>
        <span className="text-foreground/50">Weekly services: </span>
        <span className="font-medium text-foreground">
          {weeklyServiceCostCents !== null
            ? `${formatCurrency(weeklyServiceCostCents)}/week`
            : "Not set"}
        </span>
      </div>
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="text-xs font-medium text-venturo-olive hover:underline"
      >
        Edit
      </button>
    </div>
  );
}
