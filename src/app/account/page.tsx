import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import { getCurrentContract } from "@/lib/customer-contract";
import { ButtonLink } from "@/components/ui/button";
import { getLeaseEndDate, getDaysRemaining } from "@/lib/lease";
import { formatWeeklyPrice } from "@/lib/format";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import type { ChecklistItem } from "@/generated/prisma/client";

function ChecklistGroup({ title, items }: { title: string; items: ChecklistItem[] }) {
  if (items.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-medium text-foreground/70">{title}</h3>
      <ul className="mt-2 flex flex-col gap-1.5">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-2 text-sm">
            <span
              className={[
                "flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px]",
                item.completed
                  ? "bg-venturo-olive text-white"
                  : "border border-foreground/25 text-transparent",
              ].join(" ")}
            >
              ✓
            </span>
            <span className={item.completed ? "text-foreground/60 line-through" : "text-foreground"}>
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function MyStayPage() {
  const dbUser = await requireUser();
  const contract = await getCurrentContract(dbUser.id);

  if (!contract) {
    return (
      <Container size="sm" className="py-16 sm:py-20">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          My Stay
        </h1>
        <p className="mt-4 text-sm text-foreground/60">
          You don&apos;t have a lease yet —{" "}
          <Link href="/rent-a-room" className="font-medium text-venturo-olive hover:underline">
            browse available rooms
          </Link>
          .
        </p>
      </Container>
    );
  }

  const { room } = contract;
  const { home } = room;
  const endDate = getLeaseEndDate(contract.agreedAt, contract.leaseLengthMonths);
  const daysRemaining = getDaysRemaining(endDate);

  const houseRules = await prisma.document.findFirst({
    where: { type: "HOUSE_RULES" },
    orderBy: { createdAt: "desc" },
  });

  const moveInItems = contract.checklistItems.filter((item) => item.stage === "MOVE_IN");
  const moveOutItems = contract.checklistItems.filter((item) => item.stage === "MOVE_OUT");

  return (
    <Container size="sm" className="py-16 sm:py-20">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        My Stay
      </h1>

      {(!contract.leaseSigned || !contract.depositConfirmed) && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-venturo-olive/25 bg-venturo-cream-alt p-5">
          <p className="text-sm text-foreground/80">
            {!contract.leaseSigned
              ? "Your application was approved — sign your lease and pay the deposit to secure this room."
              : "Lease signed — pay the deposit to secure this room."}
            {contract.expiresAt && (
              <>
                {" "}
                Due by <strong>{contract.expiresAt.toLocaleString("en-AU")}</strong>.
              </>
            )}
          </p>
          <ButtonLink href="/account/lease" size="sm">
            {contract.leaseSigned ? "View Lease" : "Sign Lease Agreement"}
          </ButtonLink>
        </div>
      )}

      <Card className="mt-8">
        <h2 className="font-semibold text-foreground">{room.title}</h2>
        <p className="text-foreground/60">{home.address}</p>
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-foreground/50">Rent</dt>
            <dd className="mt-0.5 font-medium text-foreground">
              {formatWeeklyPrice(contract.overridePriceCents ?? room.price)}
            </dd>
          </div>
          <div>
            <dt className="text-foreground/50">Lease started</dt>
            <dd className="mt-0.5 font-medium text-foreground">
              {contract.agreedAt.toLocaleDateString("en-AU")}
            </dd>
          </div>
          <div>
            <dt className="text-foreground/50">Lease ends</dt>
            <dd className="mt-0.5 font-medium text-foreground">
              {endDate.toLocaleDateString("en-AU")}
            </dd>
          </div>
          <div className="col-span-2 sm:col-span-3">
            <dt className="text-foreground/50">Days remaining</dt>
            <dd className="mt-0.5 font-medium text-foreground">
              {daysRemaining > 0 ? `${daysRemaining} days` : "Lease ended"}
            </dd>
          </div>
        </dl>
      </Card>

      <Card className="mt-6">
        <h2 className="font-semibold text-foreground">House Info</h2>
        <dl className="mt-4 flex flex-col gap-3 text-sm">
          <div>
            <dt className="text-foreground/50">WiFi password</dt>
            <dd className="mt-0.5 font-medium text-foreground">
              {home.wifiPassword ?? "Ask your house manager"}
            </dd>
          </div>
          <div>
            <dt className="text-foreground/50">Bin day</dt>
            <dd className="mt-0.5 font-medium text-foreground">
              {home.binDay ?? "Ask your house manager"}
            </dd>
          </div>
          <div>
            <dt className="text-foreground/50">Amenities</dt>
            <dd className="mt-0.5 whitespace-pre-line text-foreground">{room.description}</dd>
          </div>
          <div>
            <dt className="text-foreground/50">House rules</dt>
            <dd className="mt-0.5">
              {houseRules ? (
                <a
                  href={houseRules.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-venturo-olive hover:underline"
                >
                  {houseRules.title}
                </a>
              ) : (
                <span className="text-foreground/60">Not uploaded yet</span>
              )}
            </dd>
          </div>
        </dl>
      </Card>

      <Card className="mt-6">
        <h2 className="font-semibold text-foreground">Move-in / Move-out Checklist</h2>
        <div className="mt-4 flex flex-col gap-4">
          <ChecklistGroup title="Move-in" items={moveInItems} />
          <ChecklistGroup title="Move-out" items={moveOutItems} />
        </div>
      </Card>
    </Container>
  );
}
