import { createClient } from "@supabase/supabase-js";

// Buckets holding admin-uploaded files, both public-read. Created manually
// via the Supabase dashboard or SQL editor — not managed by a migration.
export const PHOTO_BUCKET = "listing-photos";
export const DOCUMENT_BUCKET = "admin-documents";

// Personal application documents (ID, proof of income, etc.) — unlike the
// two buckets above, this one is private (no public-read policy), since the
// files are applicants' personal documents. Also created manually via the
// Supabase dashboard. Viewing requires a signed URL (see
// src/lib/application-documents.ts), not getPublicUrl().
export const APPLICATION_DOCS_BUCKET = "application-documents";

// Service-role client — bypasses Storage RLS entirely, so authorization
// must already have happened before this is ever constructed: via
// requireAdmin() for admin Server Actions, or via requireUser() plus an
// explicit ownership check for the user-facing application-document
// uploads. Only import this from a Server Action that has already verified
// the caller; never from anything reachable by an unverified request or a
// Client Component.
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
