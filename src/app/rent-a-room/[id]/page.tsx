import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { formatWeeklyPrice } from "@/lib/format";
import { createInterest } from "@/app/actions";
import { signContract } from "./actions";

const DEPOSIT_WINDOW_HOURS = 12;

export default async function RoomDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ signed?: string; error?: string }>;
}) {
  const { id } = await params;
  const { signed, error } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const room = await prisma.room.findUnique({
    where: { id },
    include: {
      photos: true,
      contracts: user
        ? { where: { userId: user.id }, orderBy: { agreedAt: "desc" }, take: 1 }
        : false,
      interests: user ? { where: { userId: user.id } } : false,
    },
  });

  if (!room) notFound();

  const myContract = user ? room.contracts?.[0] : undefined;
  const hasInterest = user ? (room.interests?.length ?? 0) > 0 : false;

  const notifyMeBlock = hasInterest ? (
    <p className="mt-3 text-sm font-medium text-venturo-olive">
      You&apos;re on the notify list for this room ✓
    </p>
  ) : user ? (
    <form action={createInterest} className="mt-3">
      <input type="hidden" name="roomId" value={room.id} />
      <button
        type="submit"
        className="rounded border border-venturo-olive/30 px-4 py-2 text-sm font-medium text-venturo-olive"
      >
        Notify me when available
      </button>
    </form>
  ) : (
    <Link
      href="/login"
      className="mt-3 inline-block rounded border border-venturo-olive/30 px-4 py-2 text-sm font-medium text-venturo-olive"
    >
      Log in to get notified
    </Link>
  );
  const depositDeadline = room.pendingSince
    ? new Date(room.pendingSince.getTime() + DEPOSIT_WINDOW_HOURS * 60 * 60 * 1000)
    : null;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-4xl font-bold text-venturo-olive">{room.title}</h1>
      <p className="mt-2 text-foreground/60">{room.address}</p>
      <p className="mt-4 text-foreground/80">{room.description}</p>
      <p className="mt-4 font-medium text-venturo-olive">
        {formatWeeklyPrice(room.price)} — {room.leaseLengthMonths} month lease
      </p>

      {error === "unavailable" && (
        <p className="mt-6 rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          Someone else just booked this room before you finished signing.
          Sorry — check the other listings below.
        </p>
      )}

      {room.status === "ARCHIVED" && (
        <p className="mt-6 rounded bg-foreground/5 px-3 py-2 text-sm text-foreground/60">
          This listing is no longer available.
        </p>
      )}

      {room.status === "AVAILABLE" && (
        <div className="mt-8 rounded border border-venturo-olive/30 bg-venturo-cream-alt p-4">
          {user ? (
            <form action={signContract} className="flex flex-col gap-3">
              <input type="hidden" name="roomId" value={room.id} />
              <p className="text-sm text-foreground/70">
                Signing agrees to a {room.leaseLengthMonths}-month lease at{" "}
                {formatWeeklyPrice(room.price)}, under contract version v1.0.
                (Placeholder terms — the full T&amp;Cs document is still being
                written.) The room will be held for you for{" "}
                {DEPOSIT_WINDOW_HOURS} hours to complete the deposit.
              </p>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" required />I agree to the lease terms
              </label>
              <button
                type="submit"
                className="self-start rounded bg-venturo-olive px-4 py-2 text-sm font-medium text-white"
              >
                Sign &amp; Rent This Room
              </button>
            </form>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm text-foreground/70">
                Log in to sign the lease and rent this room.
              </p>
              <Link
                href="/login"
                className="rounded bg-venturo-olive px-4 py-2 text-sm font-medium text-white"
              >
                Log In
              </Link>
            </div>
          )}
        </div>
      )}

      {room.status === "PENDING_DEPOSIT" && myContract && (
        <div className="mt-8 rounded border border-venturo-olive/30 bg-venturo-cream-alt p-4 text-sm text-foreground/80">
          {signed && <p className="mb-2 font-medium text-venturo-olive">Lease signed!</p>}
          <p>
            Next step: pay the deposit before{" "}
            <strong>{depositDeadline?.toLocaleString("en-AU")}</strong> (
            {DEPOSIT_WINDOW_HOURS} hours from signing). Deposits are handled
            manually — email{" "}
            <a href="mailto:venturo.coliving@gmail.com" className="text-venturo-olive underline">
              venturo.coliving@gmail.com
            </a>{" "}
            or call{" "}
            <a href="tel:0434682864" className="text-venturo-olive underline">
              0434 682 864
            </a>{" "}
            for bank transfer details.
          </p>
        </div>
      )}

      {room.status === "PENDING_DEPOSIT" && !myContract && (
        <div className="mt-8 rounded border border-venturo-olive/20 bg-foreground/5 p-4 text-sm text-foreground/70">
          This room is currently being booked by someone else. Check back
          later, or browse other listings.
          {notifyMeBlock}
        </div>
      )}

      {room.status === "RENTED" && (
        <div className="mt-8 rounded border border-venturo-olive/20 bg-foreground/5 p-4 text-sm text-foreground/70">
          {myContract?.depositConfirmed
            ? "You're all set — this lease is confirmed."
            : "This room is currently rented."}
          {!myContract?.depositConfirmed && notifyMeBlock}
        </div>
      )}

      <p className="mt-8">
        <Link href="/rent-a-room" className="text-sm text-venturo-olive underline">
          ← Back to all rooms
        </Link>
      </p>
    </div>
  );
}
