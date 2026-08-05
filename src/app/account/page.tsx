import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { formatWeeklyPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Field, inputClasses } from "@/components/ui/field";
import { updateName } from "./actions";
import type { Contract, Room } from "@/generated/prisma/client";

function contractStatus(contract: Contract & { room: Room }) {
  if (contract.depositConfirmed) {
    return { label: "Deposit confirmed", badge: "bg-venturo-olive/10 text-venturo-olive" };
  }
  // Approximation: only the most recently created PENDING_DEPOSIT contract
  // on a room is ever "live" (enforced by the signing transaction), so a
  // room currently pending + an unconfirmed contract means this is it.
  if (contract.room.status === "PENDING_DEPOSIT") {
    return { label: "Awaiting deposit", badge: "bg-foreground/10 text-foreground/70" };
  }
  return { label: "Not completed", badge: "bg-foreground/5 text-foreground/40" };
}

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
  const contracts = await prisma.contract.findMany({
    where: { userId: user.id },
    include: { room: true },
    orderBy: { agreedAt: "desc" },
  });

  return (
    <Container size="sm" className="py-16 sm:py-20">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        My Account
      </h1>
      <p className="mt-2 text-foreground/60">{dbUser.email}</p>

      <section className="mt-8 rounded-xl border border-venturo-olive/20 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-foreground">Profile</h2>
        <form action={updateName} className="mt-4 flex flex-wrap items-end gap-3">
          <div className="min-w-[12rem] flex-1">
            <Field label="Name">
              <input
                name="name"
                type="text"
                defaultValue={dbUser.name ?? ""}
                className={inputClasses}
              />
            </Field>
          </div>
          <Button type="submit">Save</Button>
        </form>
      </section>

      <section className="mt-10">
        <h2 className="font-semibold text-foreground">My Leases</h2>
        {contracts.length === 0 ? (
          <p className="mt-3 text-sm text-foreground/60">
            No leases yet —{" "}
            <Link href="/rent-a-room" className="font-medium text-venturo-olive hover:underline">
              browse available rooms
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {contracts.map((contract) => {
              const status = contractStatus(contract);
              return (
                <li
                  key={contract.id}
                  className="rounded-xl border border-venturo-olive/15 bg-white p-5 text-sm shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        href={`/rent-a-room/${contract.roomId}`}
                        className="font-medium text-foreground hover:text-venturo-olive"
                      >
                        {contract.room.title}
                      </Link>
                      <p className="text-foreground/60">{contract.room.address}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${status.badge}`}
                    >
                      {status.label}
                    </span>
                  </div>
                  <p className="mt-3 text-foreground/70">
                    {formatWeeklyPrice(contract.room.price)} — {contract.leaseLengthMonths}{" "}
                    month lease, signed {contract.agreedAt.toLocaleDateString("en-AU")}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </Container>
  );
}
