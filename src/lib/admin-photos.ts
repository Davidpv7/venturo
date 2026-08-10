import { prisma } from "@/lib/prisma";
import {
  createAdminClient,
  PHOTO_BUCKET,
  storagePathFromPublicUrl,
} from "@/lib/supabase/admin";
import type { Photo } from "@/generated/prisma/client";

// Exactly one of these is ever passed, matching the Photo model's own
// "exactly one of room/home is set" invariant (enforced in app code, not
// the DB — see prisma/schema.prisma).
type PhotoParent = { homeId: string } | { roomId: string };

// Shared between the Home and Room admin actions.ts files, which both do
// identical upload/delete/reorder work against Supabase Storage + the same
// Photo table — kept here once instead of duplicated per route. Returns the
// created rows so the client can append them locally instead of waiting on
// a full revalidation round-trip.
export async function uploadPhotos(
  parent: PhotoParent,
  formData: FormData,
): Promise<Photo[]> {
  const files = formData
    .getAll("photos")
    .filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) return [];

  const supabase = createAdminClient();
  const maxOrder = await prisma.photo.aggregate({
    where: parent,
    _max: { order: true },
  });
  let nextOrder = (maxOrder._max.order ?? -1) + 1;
  const folder = "homeId" in parent ? `homes/${parent.homeId}` : `rooms/${parent.roomId}`;

  const created: Photo[] = [];
  for (const file of files) {
    const path = `${folder}/${crypto.randomUUID()}-${file.name}`;
    const { error } = await supabase.storage
      .from(PHOTO_BUCKET)
      .upload(path, file, { contentType: file.type });
    if (error) throw new Error(`Photo upload failed: ${error.message}`);

    const {
      data: { publicUrl },
    } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path);

    const photo = await prisma.photo.create({
      data: { url: publicUrl, order: nextOrder, ...parent },
    });
    created.push(photo);
    nextOrder++;
  }
  return created;
}

export async function deletePhoto(photoId: string) {
  const photo = await prisma.photo.findUniqueOrThrow({ where: { id: photoId } });

  const path = storagePathFromPublicUrl(photo.url);
  if (path) {
    await createAdminClient().storage.from(PHOTO_BUCKET).remove([path]);
  }

  await prisma.photo.delete({ where: { id: photoId } });
}

// Renumbers the full list to a dense 0..n-1 sequence on every drop. The
// client supplies the desired order as a list of ids; each update is scoped
// to `parent` so an id that doesn't belong to this home/room fails the
// update (and rolls back the whole transaction) instead of letting a
// caller reorder another parent's photos.
export async function reorderPhotos(parent: PhotoParent, orderedPhotoIds: string[]) {
  await prisma.$transaction(
    orderedPhotoIds.map((id, index) =>
      prisma.photo.update({ where: { id, ...parent }, data: { order: index } }),
    ),
  );
}
