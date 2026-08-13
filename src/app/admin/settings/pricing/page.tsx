import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { formatCurrency, formatFullName } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { inputClasses } from "@/components/ui/field";
import { updateRoomPrice, setContractOverridePrice, clearContractOverridePrice } from "./actions";

export default async function AdminPricingPage() {
  await requireAdmin();

  const [rooms, contracts] = await Promise.all([
    prisma.room.findMany({
      where: { deletedAt: null },
      include: { home: true },
      orderBy: [{ home: { name: "asc" } }, { title: "asc" }],
    }),
    prisma.contract.findMany({
      include: { user: true, room: { include: { home: true } } },
      orderBy: { agreedAt: "desc" },
    }),
  ]);

  return (
    <Container size="lg" className="py-16 sm:py-20">
      <Link href="/admin/settings" className="text-sm text-foreground/60 hover:text-venturo-olive">
        ← Back to settings
      </Link>

      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Pricing
      </h1>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-foreground">Room base prices</h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-venturo-olive/15 bg-white shadow-sm">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-venturo-olive/15 text-foreground/50">
                <th className="px-5 py-3 font-medium">Home</th>
                <th className="px-5 py-3 font-medium">Room</th>
                <th className="px-5 py-3 font-medium">Weekly price (AUD)</th>
                <th className="px-5 py-3 font-medium">Currently</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.id} className="border-b border-venturo-olive/10 last:border-b-0">
                  <td className="px-5 py-3 text-foreground/70">{room.home.name}</td>
                  <td className="px-5 py-3 font-medium text-foreground">{room.title}</td>
                  <td className="px-5 py-3">
                    <form action={updateRoomPrice} className="flex items-center gap-2">
                      <input type="hidden" name="roomId" value={room.id} />
                      <input
                        name="price"
                        type="number"
                        step="0.01"
                        min="0"
                        defaultValue={room.price / 100}
                        required
                        className={`${inputClasses} w-28 py-1.5`}
                      />
                      <Button type="submit" size="sm">
                        Save
                      </Button>
                    </form>
                  </td>
                  <td className="px-5 py-3 text-foreground/50">
                    {formatCurrency(room.price)}/week
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-foreground">Tenant price overrides</h2>
        <p className="mt-1 text-sm text-foreground/60">
          Set a one-off negotiated rent for a specific tenant&apos;s signed lease. Leave
          unset to use the room&apos;s normal price.
        </p>
        {contracts.length === 0 ? (
          <p className="mt-4 rounded-xl border border-venturo-olive/15 bg-white p-6 text-sm text-foreground/60 shadow-sm">
            No signed leases yet.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-venturo-olive/15 bg-white shadow-sm">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-venturo-olive/15 text-foreground/50">
                  <th className="px-5 py-3 font-medium">Tenant</th>
                  <th className="px-5 py-3 font-medium">Room</th>
                  <th className="px-5 py-3 font-medium">Base price</th>
                  <th className="px-5 py-3 font-medium">Override (AUD/week)</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((contract) => (
                  <tr key={contract.id} className="border-b border-venturo-olive/10 align-top last:border-b-0">
                    <td className="px-5 py-4">
                      <div className="font-medium text-foreground">
                        {formatFullName(contract.user) ?? contract.user.email}
                      </div>
                      <div className="text-xs text-foreground/50">{contract.user.email}</div>
                    </td>
                    <td className="px-5 py-4 text-foreground/70">
                      {contract.room.title}
                      <div className="text-xs text-foreground/50">{contract.room.home.name}</div>
                    </td>
                    <td className="px-5 py-4 text-foreground/70">
                      {formatCurrency(contract.room.price)}/week
                    </td>
                    <td className="px-5 py-4">
                      <form action={setContractOverridePrice} className="flex items-center gap-2">
                        <input type="hidden" name="contractId" value={contract.id} />
                        <input
                          name="overridePrice"
                          type="number"
                          step="0.01"
                          min="0"
                          defaultValue={
                            contract.overridePriceCents !== null
                              ? contract.overridePriceCents / 100
                              : undefined
                          }
                          placeholder={String(contract.room.price / 100)}
                          className={`${inputClasses} w-28 py-1.5`}
                        />
                        <Button type="submit" size="sm">
                          Save
                        </Button>
                      </form>
                    </td>
                    <td className="px-5 py-4">
                      {contract.overridePriceCents !== null ? (
                        <form action={clearContractOverridePrice}>
                          <input type="hidden" name="contractId" value={contract.id} />
                          <Button type="submit" variant="secondary" size="sm">
                            Reset to base price
                          </Button>
                        </form>
                      ) : (
                        <span className="text-xs text-foreground/40">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </Container>
  );
}
