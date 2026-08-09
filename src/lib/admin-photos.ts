import { prisma } from "@/lib/prisma";
import {
  createAdminClient,
  PHOTO_BUCKET,
  storagePathFromPublicUrl,
} from "@/lib/supabase/admin";

// Exactly one of these is ever passed, matching the Photo model's own
// "exactly one of room/home is set" invariant (enforced in app code, not
// the DB — see prisma/schema.prisma).
type PhotoParent = { homeId: string } | { roomId: string };

// Shared between the Home and Room admin actions.ts files, which both do
// identical upload/delete/reorder work against Supabase Storage + the same
// Photo table — kept here once instead of duplicated per route.
export async function uploadPhotos(parent: PhotoParent, formData: FormData) {
  const files = formData
    .getAll("photos")
    .filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) return;

  const supabase = createAdminClient();
  const maxOrder = await prisma.photo.aggregate({
    where: parent,
    _max: { order: true },
  });
  let nextOrder = (maxOrder._max.order ?? -1) + 1;
  const folder = "homeId" in parent ? `homes/${parent.homeId}` : `rooms/${parent.roomId}`;

  for (const file of files) {
    const path = `${folder}/${crypto.randomUUID()}-${file.name}`;
    const { error } = await supabase.storage
      .from(PHOTO_BUCKET)
      .upload(path, file, { contentType: file.type });
    if (error) throw new Error(`Photo upload failed: ${error.message}`);

    const {
      data: { publicUrl },
    } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path);

    await prisma.photo.create({
      data: { url: publicUrl, order: nextOrder, ...parent },
    });
    nextOrder++;
  }
}

export async function deletePhoto(photoId: string) {
  const photo = await prisma.photo.findUniqueOrThrow({ where: { id: photoId } });

  const path = storagePathFromPublicUrl(photo.url);
  if (path) {
    await createAdminClient().storage.from(PHOTO_BUCKET).remove([path]);
  }

  await prisma.photo.delete({ where: { id: photoId } });
}

export async function updatePhotoOrder(photoId: string, order: number) {
  await prisma.photo.update({ where: { id: photoId }, data: { order } });
}
