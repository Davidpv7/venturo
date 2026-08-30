import { prisma } from "@/lib/prisma";
import { createAdminClient, APPLICATION_DOCS_BUCKET } from "@/lib/supabase/admin";
import type { ApplicationDocument, ApplicationDocumentType } from "@/generated/prisma/client";

// Includes HEIC/HEIF since iPhones capture camera photos in that format by
// default — without it, every mobile camera upload would be rejected.
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
];
const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;

// Supabase Storage rejects object keys containing characters outside a
// narrow set, so accented letters, apostrophes, "&", etc. in a phone's
// auto-generated filename (e.g. "IMG_1234 (résumé).pdf") fail with "Invalid
// key". The original name is kept separately in `fileName` for display.
function sanitizeStorageFileName(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w.-]+/g, "-");
}

export async function uploadApplicationDocument(
  applicationId: string,
  type: ApplicationDocumentType,
  file: File,
): Promise<ApplicationDocument> {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error("Only PDF, JPG, PNG, or HEIC files are allowed.");
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error("That file is too large — please upload something under 8MB.");
  }

  const supabase = createAdminClient();
  const path = `${applicationId}/${type}/${crypto.randomUUID()}-${sanitizeStorageFileName(file.name)}`;
  const { error } = await supabase.storage
    .from(APPLICATION_DOCS_BUCKET)
    .upload(path, file, { contentType: file.type });
  if (error) throw new Error(`Document upload failed: ${error.message}`);

  // Re-uploading the same document type replaces the previous one instead
  // of accumulating duplicates.
  const existing = await prisma.applicationDocument.findFirst({ where: { applicationId, type } });
  if (existing) {
    await supabase.storage.from(APPLICATION_DOCS_BUCKET).remove([existing.path]);
    await prisma.applicationDocument.delete({ where: { id: existing.id } });
  }

  return prisma.applicationDocument.create({
    data: { applicationId, type, path, fileName: file.name },
  });
}

export async function getApplicationDocumentSignedUrl(
  doc: ApplicationDocument,
  opts?: { download?: boolean },
) {
  const { data, error } = await createAdminClient()
    .storage.from(APPLICATION_DOCS_BUCKET)
    .createSignedUrl(doc.path, 300, opts?.download ? { download: doc.fileName } : undefined);
  if (error || !data) throw new Error(`Could not create signed URL: ${error?.message}`);
  return data.signedUrl;
}

export async function deleteApplicationDocuments(applicationId: string) {
  const docs = await prisma.applicationDocument.findMany({ where: { applicationId } });
  if (docs.length === 0) return;

  await createAdminClient()
    .storage.from(APPLICATION_DOCS_BUCKET)
    .remove(docs.map((doc) => doc.path));
  await prisma.applicationDocument.deleteMany({ where: { applicationId } });
}
