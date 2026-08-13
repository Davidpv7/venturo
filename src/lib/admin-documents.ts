import { prisma } from "@/lib/prisma";
import { createAdminClient, DOCUMENT_BUCKET, storagePathFromPublicUrl } from "@/lib/supabase/admin";
import type { Document, DocumentType } from "@/generated/prisma/client";

export async function uploadDocument(formData: FormData): Promise<Document> {
  const title = formData.get("title") as string;
  const type = formData.get("type") as DocumentType;
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("A file is required.");
  }

  const supabase = createAdminClient();
  const path = `${type}/${crypto.randomUUID()}-${file.name}`;
  const { error } = await supabase.storage
    .from(DOCUMENT_BUCKET)
    .upload(path, file, { contentType: file.type });
  if (error) throw new Error(`Document upload failed: ${error.message}`);

  const {
    data: { publicUrl },
  } = supabase.storage.from(DOCUMENT_BUCKET).getPublicUrl(path);

  return prisma.document.create({ data: { title, type, url: publicUrl } });
}

export async function deleteDocument(documentId: string) {
  const document = await prisma.document.findUniqueOrThrow({ where: { id: documentId } });

  const path = storagePathFromPublicUrl(document.url, DOCUMENT_BUCKET);
  if (path) {
    await createAdminClient().storage.from(DOCUMENT_BUCKET).remove([path]);
  }

  await prisma.document.delete({ where: { id: documentId } });
}
