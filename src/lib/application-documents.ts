import { prisma } from "@/lib/prisma";
import { createAdminClient, APPLICATION_DOCS_BUCKET } from "@/lib/supabase/admin";
import type { ApplicationDocument, ApplicationDocumentType } from "@/generated/prisma/client";

const ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"];

export async function uploadApplicationDocument(
  applicationId: string,
  type: ApplicationDocumentType,
  file: File,
): Promise<ApplicationDocument> {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error("Only PDF, JPG, or PNG files are allowed.");
  }

  const supabase = createAdminClient();
  const path = `${applicationId}/${type}/${crypto.randomUUID()}-${file.name}`;
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

export async function getApplicationDocumentSignedUrl(doc: ApplicationDocument) {
  const { data, error } = await createAdminClient()
    .storage.from(APPLICATION_DOCS_BUCKET)
    .createSignedUrl(doc.path, 300);
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
