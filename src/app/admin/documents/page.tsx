import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Field, inputClasses } from "@/components/ui/field";
import { uploadDocument, deleteDocument } from "./actions";
import type { DocumentType } from "@/generated/prisma/client";

const DOCUMENT_TYPE_LABEL: Record<DocumentType, string> = {
  HOUSE_RULES: "House rules",
  LEASE_TEMPLATE: "Lease template",
  OTHER: "Other",
};

export default async function AdminDocumentsPage() {
  await requireAdmin();

  const documents = await prisma.document.findMany({
    orderBy: [{ type: "asc" }, { createdAt: "desc" }],
  });

  return (
    <Container size="md" className="py-16 sm:py-20">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Documents
      </h1>
      <p className="mt-4 max-w-xl text-foreground/80">
        House rules, lease templates, and other files shared with tenants.
      </p>

      <Card className="mt-8">
        <h2 className="font-semibold text-foreground">Upload a document</h2>
        <form action={uploadDocument} className="mt-4 flex flex-col gap-4">
          <Field label="Title">
            <input name="title" type="text" required className={inputClasses} />
          </Field>
          <Field label="Type">
            <select name="type" required defaultValue="HOUSE_RULES" className={inputClasses}>
              {Object.entries(DOCUMENT_TYPE_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="File">
            <input name="file" type="file" required className={inputClasses} />
          </Field>
          <Button type="submit" className="self-start">
            Upload
          </Button>
        </form>
      </Card>

      {documents.length === 0 ? (
        <p className="mt-8 text-sm text-foreground/60">No documents yet.</p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-venturo-olive/15 bg-white shadow-sm">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-venturo-olive/15 text-foreground/50">
                <th className="px-5 py-3 font-medium">Title</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Uploaded</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((document) => (
                <tr key={document.id} className="border-b border-venturo-olive/10 last:border-b-0">
                  <td className="px-5 py-3 font-medium text-foreground">{document.title}</td>
                  <td className="px-5 py-3 text-foreground/70">
                    {DOCUMENT_TYPE_LABEL[document.type]}
                  </td>
                  <td className="px-5 py-3 text-foreground/70">
                    {document.createdAt.toLocaleDateString("en-AU")}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <a
                        href={document.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-venturo-olive hover:underline"
                      >
                        View
                      </a>
                      <form action={deleteDocument}>
                        <input type="hidden" name="documentId" value={document.id} />
                        <Button type="submit" variant="secondary" size="sm">
                          Delete
                        </Button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Container>
  );
}
