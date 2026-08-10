"use client";

import { useEffect, useRef, useState, useTransition, type ChangeEvent } from "react";
import { ButtonLabel } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SortablePhotoList } from "@/components/admin/sortable-photo-list";
import type { Photo } from "@/generated/prisma/client";

type UploadState = "idle" | "uploading" | "uploaded" | "error";

function sortByOrder(photos: Photo[]) {
  return [...photos].sort((a, b) => a.order - b.order);
}

// Shared between the Home and Room admin edit pages — same upload/reorder/
// delete UI either way, just pointed at a different parent id field and a
// different set of Server Actions (which are still just serializable
// references, safe to pass down as props from a Server Component).
export function PhotoManager({
  photos: photosProp,
  parentIdField,
  parentId,
  uploadAction,
  deleteAction,
  reorderAction,
}: {
  photos: Photo[];
  parentIdField: "homeId" | "roomId";
  parentId: string;
  uploadAction: (formData: FormData) => Promise<Photo[]>;
  deleteAction: (photoId: string) => Promise<void>;
  reorderAction: (parentId: string, orderedPhotoIds: string[]) => Promise<void>;
}) {
  const [photos, setPhotos] = useState<Photo[]>(() => sortByOrder(photosProp));
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [isPending, startTransition] = useTransition();
  const draggingRef = useRef(false);

  // Re-sync from the server-confirmed prop whenever it actually changes
  // (revalidatePath refreshes it shortly after every action resolves), so
  // local optimistic state is a short-lived prediction, not a permanent
  // parallel source of truth. Skipped mid-drag so an unrelated update can't
  // yank a photo out from under the admin's cursor.
  const propsSignature = photosProp.map((p) => `${p.id}:${p.order}`).join(",");
  useEffect(() => {
    if (draggingRef.current) return;
    setPhotos(sortByOrder(photosProp));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propsSignature]);

  useEffect(() => {
    if (uploadState !== "uploaded") return;
    const timeout = setTimeout(() => setUploadState("idle"), 2000);
    return () => clearTimeout(timeout);
  }, [uploadState]);

  function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    formData.append(parentIdField, parentId);
    for (const file of Array.from(files)) formData.append("photos", file);

    setUploadState("uploading");
    startTransition(async () => {
      try {
        const created = await uploadAction(formData);
        setPhotos((prev) => [...prev, ...created]);
        setUploadState("uploaded");
      } catch {
        setUploadState("error");
      }
    });
    e.target.value = "";
  }

  function handleReorder(orderedIds: string[]) {
    const byId = new Map(photos.map((p) => [p.id, p]));
    setPhotos(orderedIds.map((id) => byId.get(id)!));
    draggingRef.current = true;
    startTransition(async () => {
      try {
        // parentId travels as a plain call argument (like deleteAction's
        // photoId) rather than pre-bound via .bind() on the server side —
        // this is the pattern the Next.js docs show for direct, non-<form>
        // invocation of an action that needs an id beyond its main payload.
        await reorderAction(parentId, orderedIds);
      } catch {
        setPhotos(sortByOrder(photosProp));
      } finally {
        draggingRef.current = false;
      }
    });
  }

  function handleDelete(photoId: string) {
    const removed = photos.find((p) => p.id === photoId);
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    startTransition(async () => {
      try {
        await deleteAction(photoId);
      } catch {
        if (removed) setPhotos((prev) => sortByOrder([...prev, removed]));
      }
    });
  }

  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold text-foreground">Photos</h2>

      <div className="mt-4 rounded-xl border border-venturo-olive/15 bg-white p-4 shadow-sm">
        {photos.length === 0 ? (
          <p className="text-sm text-foreground/60">No photos yet.</p>
        ) : (
          <SortablePhotoList
            photos={photos}
            onReorder={handleReorder}
            onDelete={handleDelete}
            disabled={isPending}
          />
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-venturo-olive/10 pt-4">
          <ButtonLabel
            htmlFor={`photos-${parentId}`}
            variant="primary"
            size="sm"
            className={isPending ? "pointer-events-none opacity-50" : ""}
          >
            Add Photos
          </ButtonLabel>
          <input
            type="file"
            id={`photos-${parentId}`}
            accept="image/*"
            multiple
            className="sr-only"
            disabled={isPending}
            onChange={handleFileSelect}
          />
          {uploadState === "uploading" && <ProgressBar className="max-w-40" />}
          {uploadState === "uploaded" && (
            <span className="text-sm font-medium text-venturo-olive">Uploaded</span>
          )}
          {uploadState === "error" && (
            <span className="text-sm text-red-600">Upload failed — try again.</span>
          )}
        </div>
      </div>
    </section>
  );
}
