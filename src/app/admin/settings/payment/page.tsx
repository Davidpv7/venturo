import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { updatePaymentSettings } from "./actions";

export default async function AdminPaymentSettingsPage() {
  await requireAdmin();

  const settings = await prisma.paymentSettings.findUnique({ where: { id: "singleton" } });

  return (
    <Container size="sm" className="py-16 sm:py-20">
      <Link href="/admin/settings" className="text-sm text-foreground/60 hover:text-venturo-olive">
        ← Back to settings
      </Link>

      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Payment
      </h1>
      <p className="mt-2 text-sm text-foreground/60">
        Tenants pay rent by manual bank transfer — this is the bank account text they see when
        they click &quot;Pay My Rent&quot;. Include whatever they need: bank name, account name,
        BSB/routing number, account number, and how to fill in the transfer reference.
      </p>

      <Card className="mt-8">
        <form action={updatePaymentSettings} className="flex flex-col gap-4">
          <Field label="Bank details">
            <textarea
              name="bankDetails"
              rows={8}
              required
              defaultValue={settings?.bankDetails ?? ""}
              placeholder={
                "Account name: Venturo Co-living\nBSB: 000-000\nAccount number: 00000000\nReference: your full name + room name"
              }
              className="rounded-md border border-venturo-olive/25 bg-white px-3 py-2.5 text-sm text-foreground placeholder:text-foreground/40 focus:border-venturo-olive/50 focus:outline-none focus:ring-2 focus:ring-venturo-olive/30"
            />
          </Field>
          <Button type="submit" className="self-start">
            Save
          </Button>
        </form>
      </Card>
    </Container>
  );
}
