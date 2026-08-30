"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import { sendEmail, leaseSignedEmail, leaseSignedAdminEmail, getAdminEmails } from "@/lib/email";
import type { GovernmentIdType } from "@/generated/prisma/client";

const GOVERNMENT_ID_TYPES: GovernmentIdType[] = ["DRIVERS_LICENCE", "PASSPORT", "OTHER"];

function isGovernmentIdType(value: string | null): value is GovernmentIdType {
  return value !== null && (GOVERNMENT_ID_TYPES as string[]).includes(value);
}

export async function signLease(formData: FormData) {
  const dbUser = await requireUser();
  const contractId = formData.get("contractId") as string;

  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: { room: { include: { home: true } } },
  });

  // Re-derive ownership and state inside the action itself — never trust
  // the page-level guard alone, since Server Actions are directly callable
  // once deployed (same reasoning as requireAdmin's own comment).
  if (!contract || contract.userId !== dbUser.id) redirect("/account/lease");
  if (contract.leaseSigned) redirect("/account/lease"); // idempotent — no re-signing
  if (contract.expiresAt && contract.expiresAt < new Date()) {
    redirect("/account/lease?error=expired");
  }

  const governmentIdTypeRaw = contract.governmentIdType ?? (formData.get("governmentIdType") as string | null);
  const governmentIdNumber = (contract.governmentIdNumber ?? (formData.get("governmentIdNumber") as string))?.trim();
  const emergencyContactName = (dbUser.emergencyContactName ?? (formData.get("emergencyContactName") as string))?.trim();
  const emergencyContactPhone = (dbUser.emergencyContactPhone ?? (formData.get("emergencyContactPhone") as string))?.trim();
  const emergencyContactRelationship = (
    dbUser.emergencyContactRelationship ?? (formData.get("emergencyContactRelationship") as string)
  )?.trim();
  const leaseSignedName = (formData.get("leaseSignedName") as string)?.trim();
  const agreed = formData.get("agree") === "1";

  if (
    !isGovernmentIdType(governmentIdTypeRaw) ||
    !governmentIdNumber ||
    !emergencyContactName ||
    !emergencyContactPhone ||
    !emergencyContactRelationship ||
    !leaseSignedName ||
    !agreed
  ) {
    redirect("/account/lease?error=missing-fields");
  }

  // vehicleRegistration/insuranceProvider stay optional, per the source
  // document's own "(optional)" tag.
  const vehicleRegistration = (contract.vehicleRegistration ?? (formData.get("vehicleRegistration") as string))?.trim() || null;
  const insuranceProvider = (contract.insuranceProvider ?? (formData.get("insuranceProvider") as string))?.trim() || null;

  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

  await prisma.$transaction(async (tx) => {
    await tx.contract.update({
      where: { id: contract.id },
      data: {
        governmentIdType: governmentIdTypeRaw,
        governmentIdNumber,
        vehicleRegistration,
        insuranceProvider,
        leaseSigned: true,
        leaseSignedAt: new Date(),
        leaseSignedName,
        leaseSignedIp: ip,
      },
    });

    await tx.user.update({
      where: { id: dbUser.id },
      data: { emergencyContactName, emergencyContactPhone, emergencyContactRelationship },
    });
  });

  revalidatePath("/account/lease");
  revalidatePath("/account", "layout");
  revalidatePath("/admin/homes");
  revalidatePath(`/admin/leases/${contract.id}`);

  const tenantName = leaseSignedName || dbUser.name || "Tenant";

  const signed = leaseSignedEmail(contract.room.title, contract.room.home.name);
  await sendEmail({ to: dbUser.email, ...signed });

  const adminAlert = leaseSignedAdminEmail(tenantName, contract.room.title, contract.room.home.name, contract.id);
  await sendEmail({ to: await getAdminEmails(), ...adminAlert, replyTo: dbUser.email });
}
