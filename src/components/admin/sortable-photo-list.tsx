"use client";

import Image from "next/image";
import { useId } from "react";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import type { Photo } from "@/generated/prisma/client";

// Drag-to-reorder list of photo thumbnails, shared between the Home and
// Room admin photo managers. Owns only the drag gesture — the parent
// (PhotoManager) owns the photo list state and persistence.
export function SortablePhotoList({
  photos,
  onReorder,
  onDelete,
  disabled,
}: {
  photos: Photo[];
  onReorder: (orderedIds: string[]) => void;
  onDelete: (photoId: string) => void;
  disabled: boolean;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  // dnd-kit auto-generates ids for aria-describedby off a module-level
  // counter, which drifts between the SSR pass and the client hydration
  // pass once more than one DndContext has mounted anywhere in the app —
  // a stable id keeps server and client markup in sync.
  const dndId = useId();

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = photos.findIndex((p) => p.id === active.id);
    const newIndex = photos.findIndex((p) => p.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    onReorder(arrayMove(photos, oldIndex, newIndex).map((p) => p.id));
  }

  return (
    <DndContext
      id={dndId}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={photos.map((p) => p.id)} strategy={rectSortingStrategy}>
        <div className="flex flex-wrap gap-3">
          {photos.map((photo) => (
            <SortablePhotoCard
              key={photo.id}
              photo={photo}
              onDelete={() => onDelete(photo.id)}
              disabled={disabled}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortablePhotoCard({
  photo,
  onDelete,
  disabled,
}: {
  photo: Photo;
  onDelete: () => void;
  disabled: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: photo.id,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex w-28 flex-col items-center gap-2 rounded-xl border border-venturo-olive/15 bg-white p-2 shadow-sm ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="touch-none cursor-grab active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <Image
          src={photo.url}
          alt=""
          width={96}
          height={96}
          className="h-24 w-24 rounded-md object-cover"
        />
      </button>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={onDelete}
        disabled={disabled}
        className="w-full"
      >
        Delete
      </Button>
    </div>
  );
}
