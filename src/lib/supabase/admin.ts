import { createClient } from "@supabase/supabase-js";

// Buckets holding admin-uploaded files, both public-read. Created manually
// via the Supabase dashboard or SQL editor — not managed by a migration.
export const PHOTO_BUCKET = "listing-photos";
export const DOCUMENT_BUCKET = "admin-documents";

// Service-role client — bypasses Storage RLS entirely, so authorization
// must already have happened via requireAdmin() before this is ever
// constructed. Only import this from admin Server Actions; never from
// anything reachable by a non-admin request or a Client Component.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

// getPublicUrl() output always has this shape, so the path can be recovered
// from a stored url for deletes without a separate "path" column.
export function storagePathFromPublicUrl(publicUrl: string, bucket: string = PHOTO_BUCKET) {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const index = publicUrl.indexOf(marker);
  return index === -1 ? null : publicUrl.slice(index + marker.length);
}
