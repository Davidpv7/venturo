import Image from "next/image";
import { Button, ButtonLabel } from "@/components/ui/button";
import { inputClasses } from "@/components/ui/field";
import type { Photo } from "@/generated/prisma/client";

// Shared between the Home and Room admin edit pages — same upload/reorder/
// delete UI either way, just pointed at a different parent id field and a
// different set of Server Actions (which are still just serializable
// references, safe to pass down as props from a Server Component).
export function PhotoManager({
  photos,
  parentIdField,
  parentId,
  uploadAction,
  deleteAction,
  reorderAction,
}: {
  photos: Photo[];
  parentIdField: "homeId" | "roomId";
  parentId: string;
  uploadAction: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
  reorderAction: (formData: FormData) => Promise<void>;
}) {
  const sorted = [...photos].sort((a, b) => a.order - b.order);

  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold text-foreground">Photos</h2>

      {sorted.length === 0 ? (
        <p className="mt-4 text-sm text-foreground/60">No photos yet.</p>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {sorted.map((photo) => (
            <div
              key={photo.id}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-venturo-olive/15 bg-white p-3 shadow-sm"
            >
              <Image
                src={photo.url}
                alt=""
                width={64}
                height={64}
                className="h-16 w-16 shrink-0 rounded-md object-cover"
              />
              <form action={reorderAction} className="flex items-center gap-2">
                <input type="hidden" name="photoId" value={photo.id} />
                <input
                  type="number"
                  name="order"
                  defaultValue={photo.order}
                  className={`${inputClasses} w-20`}
                />
                <Button type="submit" variant="secondary" size="sm">
                  Save Order
                </Button>
              </form>
              <form action={deleteAction}>
                <input type="hidden" name="photoId" value={photo.id} />
                <Button type="submit" variant="secondary" size="sm">
                  Delete
                </Button>
              </form>
            </div>
          ))}
        </div>
      )}

      <form
        action={uploadAction}
        className="mt-6 flex flex-col gap-3 rounded-xl border border-venturo-olive/15 bg-white p-6 shadow-sm"
      >
        <input type="hidden" name={parentIdField} value={parentId} />
        <div className="flex flex-wrap items-center gap-3">
          <ButtonLabel htmlFor={`photos-${parentId}`} variant="secondary" size="sm">
            Choose files to upload
          </ButtonLabel>
          <input
            type="file"
            name="photos"
            id={`photos-${parentId}`}
            accept="image/*"
            multiple
            className="sr-only"
          />
          <Button type="submit" size="sm">
            Upload
          </Button>
        </div>
      </form>
    </section>
  );
}
