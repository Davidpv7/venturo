import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { getInvoiceDisplayStatus } from "@/lib/invoices";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Field, inputClasses } from "@/components/ui/field";
import { PhotoManager } from "@/components/admin/photo-manager";
import { RoomStatusBadge } from "@/components/admin/room-status-badge";
import { InvoiceStatusBadge } from "@/components/invoice-status-badge";
import {
  updateRoom,
  deleteRoom,
  uploadRoomPhotos,
  deleteRoomPhoto,
  reorderRoomPhotos,
  createInvoice,
  markInvoicePaid,
  toggleChecklistItem,
} from "./actions";

const CHECKLIST_STAGE_LABEL = { MOVE_IN: "Move-in", MOVE_OUT: "Move-out" } as const;

const deleteErrors: Record<string, string> = {
  "has-history":
    "Can't delete a room with a signed lease or notify-me history — use Archive on the admin dashboard instead.",
};

export default async function EditRoomPage({
  params,
  searchParams,
}: {
  params: Promise<{ homeId: string; roomId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const { homeId, roomId } = await params;
  const { error } = await searchParams;

  const room = await prisma.room.findFirst({
    where: { id: roomId, deletedAt: null },
    include: { home: true, photos: true },
  });

  if (!room || room.homeId !== homeId) notFound();

  const latestContract = await prisma.contract.findFirst({
    where: { roomId },
    orderBy: { agreedAt: "desc" },
    include: {
      user: true,
      invoices: { orderBy: { dueDate: "asc" } },
      checklistItems: true,
    },
  });

  return (
    <Container size="sm" className="py-16 sm:py-20">
      <Link
        href={`/admin/homes/${homeId}`}
        className="text-sm text-foreground/60 hover:text-venturo-olive"
      >
        ← Back to {room.home.name}
      </Link>

      <div className="mt-4 flex items-center gap-3">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {room.title}
        </h1>
        <RoomStatusBadge status={room.status} />
      </div>
      <p className="mt-2 text-sm text-foreground/50">
        To change availability status, use the actions on{" "}
        <Link href="/admin/homes" className="text-venturo-olive hover:underline">
          Homes &amp; Rooms
        </Link>
        .
      </p>

      {error && deleteErrors[error] && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2.5 text-sm text-red-700">
          {deleteErrors[error]}
        </p>
      )}

      <section className="mt-8 rounded-xl border border-venturo-olive/15 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-foreground">Details</h2>
        <form action={updateRoom} className="mt-4 flex flex-col gap-4">
          <input type="hidden" name="roomId" value={room.id} />
          <Field label="Title">
            <input
              name="title"
              type="text"
              defaultValue={room.title}
              required
              className={inputClasses}
            />
          </Field>
          <Field label="Weekly price (AUD)">
            <input
              name="price"
              type="number"
              step="0.01"
              min="0"
              defaultValue={room.price / 100}
              required
              className={inputClasses}
            />
          </Field>
          <Field label="Lease length (months)">
            <input
              name="leaseLengthMonths"
              type="number"
              step="1"
              min="1"
              defaultValue={room.leaseLengthMonths}
              required
              className={inputClasses}
            />
          </Field>
          <Field label="Description">
            <textarea
              name="description"
              defaultValue={room.description}
              required
              rows={4}
              className={inputClasses}
            />
          </Field>
          <Button type="submit" className="self-start">
            Save Changes
          </Button>
        </form>

        <form action={deleteRoom} className="mt-6 border-t border-venturo-olive/10 pt-4">
          <input type="hidden" name="roomId" value={room.id} />
          <input type="hidden" name="homeId" value={homeId} />
          <Button type="submit" variant="secondary" size="sm">
            Delete Room
          </Button>
        </form>
      </section>

      <PhotoManager
        photos={room.photos}
        parentIdField="roomId"
        parentId={room.id}
        uploadAction={uploadRoomPhotos}
        deleteAction={deleteRoomPhoto}
        reorderAction={reorderRoomPhotos}
      />

      {latestContract && (
        <>
          <Card className="mt-10">
            <h2 className="font-semibold text-foreground">
              Invoices — {latestContract.user.email}
            </h2>
            {latestContract.invoices.length === 0 ? (
              <p className="mt-3 text-sm text-foreground/60">No invoices yet.</p>
            ) : (
              <ul className="mt-4 flex flex-col gap-2">
                {latestContract.invoices.map((invoice) => (
                  <li
                    key={invoice.id}
                    className="flex items-center justify-between gap-3 rounded-md border border-venturo-olive/10 px-4 py-3 text-sm"
                  >
                    <div>
                      <p className="font-medium text-foreground">{invoice.number}</p>
                      <p className="text-foreground/60">
                        {formatCurrency(invoice.amountCents)} — due{" "}
                        {invoice.dueDate.toLocaleDateString("en-AU")}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <InvoiceStatusBadge status={getInvoiceDisplayStatus(invoice)} />
                      {invoice.status !== "PAID" && (
                        <form action={markInvoicePaid}>
                          <input type="hidden" name="invoiceId" value={invoice.id} />
                          <Button type="submit" variant="secondary" size="sm">
                            Mark paid
                          </Button>
                        </form>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <form action={createInvoice} className="mt-6 flex flex-wrap items-end gap-3 border-t border-venturo-olive/10 pt-4">
              <input type="hidden" name="contractId" value={latestContract.id} />
              <div className="min-w-[8rem]">
                <Field label="Invoice #">
                  <input name="number" type="text" required className={inputClasses} />
                </Field>
              </div>
              <div className="min-w-[8rem]">
                <Field label="Amount (AUD)">
                  <input
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    className={inputClasses}
                  />
                </Field>
              </div>
              <div className="min-w-[10rem]">
                <Field label="Due date">
                  <input name="dueDate" type="date" required className={inputClasses} />
                </Field>
              </div>
              <Button type="submit">Add Invoice</Button>
            </form>
          </Card>

          <Card className="mt-6">
            <h2 className="font-semibold text-foreground">
              Move-in / Move-out Checklist — {latestContract.user.email}
            </h2>
            {latestContract.checklistItems.length === 0 ? (
              <p className="mt-3 text-sm text-foreground/60">No checklist items.</p>
            ) : (
              <ul className="mt-4 flex flex-col gap-2">
                {latestContract.checklistItems.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-md border border-venturo-olive/10 px-4 py-3 text-sm"
                  >
                    <div>
                      <span className="mr-2 text-xs font-medium uppercase tracking-wide text-foreground/40">
                        {CHECKLIST_STAGE_LABEL[item.stage]}
                      </span>
                      <span className={item.completed ? "text-foreground/60 line-through" : "text-foreground"}>
                        {item.label}
                      </span>
                    </div>
                    <form action={toggleChecklistItem}>
                      <input type="hidden" name="itemId" value={item.id} />
                      <Button type="submit" variant="secondary" size="sm">
                        {item.completed ? "Mark not done" : "Mark done"}
                      </Button>
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      )}
    </Container>
  );
}
