import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { formatWeeklyPrice } from "@/lib/format";
import { allowedLeaseLengths, formatLeaseLengthOptions } from "@/lib/lease-lengths";
import { createInterest } from "@/app/actions";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, inputClasses } from "@/components/ui/field";
import { Container } from "@/components/ui/container";
import { RoomPhotoGallery } from "@/components/room-photo-gallery";
import { LocationMap } from "@/components/location-map";
import { DescriptionMarkdown } from "@/components/ui/description-markdown";
import { startOrResumeApplication, askRoomQuestion } from "./actions";

const DEPOSIT_WINDOW_HOURS = 12;

export default async function RoomDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ homeId: string; roomId: string }>;
  searchParams: Promise<{ asked?: string }>;
}) {
  const { homeId, roomId: id } = await params;
  const { asked } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const room = await prisma.room.findFirst({
    where: { id, deletedAt: null },
    include: {
      photos: true,
      home: true,
      contracts: user
        ? { where: { userId: user.id }, orderBy: { agreedAt: "desc" }, take: 1 }
        : false,
      interests: user ? { where: { userId: user.id } } : false,
    },
  });

  if (!room || room.homeId !== homeId) notFound();

  const myContract = user ? room.contracts?.[0] : undefined;
  const hasInterest = user ? (room.interests?.length ?? 0) > 0 : false;

  const notifyMeBlock = hasInterest ? (
    <p className="mt-3 text-sm font-medium text-venturo-olive">
      You&apos;re on the notify list for this room ✓
    </p>
  ) : user ? (
    <form action={createInterest} className="mt-3">
      <input type="hidden" name="roomId" value={room.id} />
      <Button type="submit" variant="secondary" size="sm">
        Notify me when available
      </Button>
    </form>
  ) : (
    <ButtonLink href="/login" variant="secondary" size="sm" className="mt-3">
      Log in to get notified
    </ButtonLink>
  );
  const depositDeadline = room.pendingSince
    ? new Date(room.pendingSince.getTime() + DEPOSIT_WINDOW_HOURS * 60 * 60 * 1000)
    : null;

  return (
    <Container className="py-16 sm:py-20">
      <Link
        href={`/rent-a-room/${homeId}`}
        className="text-sm text-foreground/60 hover:text-venturo-olive"
      >
        ← Back to {room.home.name}
      </Link>

      <div className="mt-4">
        <RoomPhotoGallery photos={room.photos} title={room.title} />
      </div>

      <div className="mt-8 max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {room.title}
        </h1>
        <p className="mt-2 text-foreground/60">Part of {room.home.name}</p>
        <p className="mt-4 font-medium text-venturo-olive">
          {formatWeeklyPrice(room.price)} — {formatLeaseLengthOptions(allowedLeaseLengths(room))}
        </p>
        <p className="mt-4 line-clamp-2 leading-relaxed text-foreground/80">
          {room.subtitle ?? room.description}
        </p>

        {room.status === "ARCHIVED" && (
          <p className="mt-6 rounded-md bg-foreground/5 px-3 py-2.5 text-sm text-foreground/60">
            This listing is no longer available.
          </p>
        )}

        {room.status === "AVAILABLE" && (
          <div className="mt-6 rounded-xl border border-venturo-olive/25 bg-venturo-cream-alt p-5">
            {user ? (
              <form action={startOrResumeApplication} className="flex flex-col gap-4">
                <input type="hidden" name="roomId" value={room.id} />
                <input type="hidden" name="homeId" value={homeId} />
                <p className="text-sm leading-relaxed text-foreground/70">
                  Ready to apply? Tell us a bit about yourself in a few short
                  steps — you can save your progress and come back any time.
                </p>
                <Button type="submit" className="self-start">
                  Start Application for this Room
                </Button>
              </form>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-foreground/70">
                  Log in to apply for this room.
                </p>
                <ButtonLink href="/login">Log In</ButtonLink>
              </div>
            )}
          </div>
        )}

        {room.status === "PENDING_DEPOSIT" && myContract && (
          <div className="mt-6 rounded-xl border border-venturo-olive/25 bg-venturo-cream-alt p-5 text-sm text-foreground/80">
            <p className="leading-relaxed">
              Next step: pay the deposit before{" "}
              <strong>{depositDeadline?.toLocaleString("en-AU")}</strong> (
              {DEPOSIT_WINDOW_HOURS} hours from signing). Deposits are handled
              manually — email{" "}
              <a
                href="mailto:venturo.coliving@gmail.com"
                className="text-venturo-olive underline"
              >
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
          <div className="mt-6 rounded-xl border border-venturo-olive/15 bg-foreground/5 p-5 text-sm text-foreground/70">
            This room is currently being booked by someone else. Check back
            later, or browse other listings.
            {notifyMeBlock}
          </div>
        )}

        {room.status === "RENTED" && (
          <div className="mt-6 rounded-xl border border-venturo-olive/15 bg-foreground/5 p-5 text-sm text-foreground/70">
            {myContract?.depositConfirmed
              ? "You're all set — this lease is confirmed."
              : "This room is currently rented."}
            {!myContract?.depositConfirmed && notifyMeBlock}
          </div>
        )}
      </div>

      <div className="mt-12 max-w-2xl border-t border-venturo-olive/15 pt-10">
        <h2 className="text-xl font-semibold text-foreground">About this room</h2>
        <DescriptionMarkdown
          text={room.description}
          className="mt-3 leading-relaxed text-foreground/80"
        />
      </div>

      <div className="mt-12 max-w-2xl border-t border-venturo-olive/15 pt-10">
        <h2 className="text-xl font-semibold text-foreground">Location</h2>
        <p className="mt-2 text-foreground/60">{room.home.address}</p>
        <div className="mt-4">
          <LocationMap address={room.home.address} />
        </div>
      </div>

      <div className="mt-12 max-w-2xl border-t border-venturo-olive/15 pt-10">
        <h2 className="text-xl font-semibold text-foreground">Ask a question</h2>
        {asked === "1" ? (
          <p className="mt-3 text-sm font-medium text-venturo-olive">
            Thanks — we&apos;ll reply by email.
          </p>
        ) : user ? (
          <form action={askRoomQuestion} className="mt-3 flex flex-col gap-3">
            <input type="hidden" name="roomId" value={room.id} />
            <input type="hidden" name="homeId" value={homeId} />
            <Field label="Your question">
              <textarea
                name="message"
                required
                rows={4}
                className={inputClasses}
                placeholder={`Ask us anything about ${room.title}…`}
              />
            </Field>
            <Button type="submit" className="self-start">
              Send question
            </Button>
          </form>
        ) : (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-venturo-olive/15 bg-foreground/5 p-5 text-sm text-foreground/70">
            <p>Log in to ask a question about this room.</p>
            <ButtonLink href="/login" variant="secondary" size="sm">
              Log In
            </ButtonLink>
          </div>
        )}
      </div>
    </Container>
  );
}
