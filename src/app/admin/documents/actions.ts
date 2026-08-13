"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import { uploadDocument as uploadDocumentFile, deleteDocument as deleteDocumentFile } from "@/lib/admin-documents";

export async function uploadDocument(formData: FormData) {
  await requireAdmin();

  await uploadDocumentFile(formData);

  revalidatePath("/admin/documents");
}

export async function deleteDocument(formData: FormData) {
  await requireAdmin();
  const documentId = formData.get("documentId") as string;

  await deleteDocumentFile(documentId);

  revalidatePath("/admin/documents");
}
