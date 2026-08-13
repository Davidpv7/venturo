"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import { uploadApplicationDocument } from "@/lib/application-documents";
import { nextApplicationStep } from "@/lib/application-steps";
import type { ApplicationDocumentType, EmploymentStatus } from "@/generated/prisma/client";

// Every step-save action re-checks ownership and draft status itself, not
// just relying on the layout guard — Server Actions are directly callable
// once deployed (see src/lib/require-admin.ts's comment on the same rule).
async function loadOwnedDraftApplication(dbUserId: string, applicationId: string) {
  const application = await prisma.application.findUniqueOrThrow({ where: { id: applicationId } });
  if (application.userId !== dbUserId || application.status !== "DRAFT") {
    redirect(`/account/applications/${applicationId}`);
  }
  return application;
}

async function uploadIfPresent(
  applicationId: string,
  formData: FormData,
  fieldName: string,
  type: ApplicationDocumentType,
) {
  const file = formData.get(fieldName);
  if (file instanceof File && file.size > 0) {
    await uploadApplicationDocument(applicationId, type, file);
  }
}

export async function saveApplicationPersonal(formData: FormData) {
  const dbUser = await requireUser();
  const applicationId = formData.get("applicationId") as string;
  await loadOwnedDraftApplication(dbUser.id, applicationId);

  const dateOfBirth = formData.get("dateOfBirth") as string;
  const preferredMoveIn = formData.get("preferredMoveIn") as string;
  const intendedStayMonths = formData.get("intendedStayMonths") as string;

  await prisma.application.update({
    where: { id: applicationId },
    data: {
      legalFirstName: (formData.get("legalFirstName") as string).trim(),
      legalLastName: (formData.get("legalLastName") as string).trim(),
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      phone: (formData.get("phone") as string).trim(),
      email: (formData.get("email") as string).trim(),
      currentAddress: (formData.get("currentAddress") as string).trim(),
      preferredMoveIn: preferredMoveIn ? new Date(preferredMoveIn) : null,
      intendedStayMonths: intendedStayMonths ? parseInt(intendedStayMonths, 10) : null,
    },
  });

  revalidatePath(`/apply/${applicationId}`, "layout");
  redirect(`/apply/${applicationId}/${nextApplicationStep("personal")}`);
}

export async function saveApplicationIdentity(formData: FormData) {
  const dbUser = await requireUser();
  const applicationId = formData.get("applicationId") as string;
  await loadOwnedDraftApplication(dbUser.id, applicationId);

  // Distinguish "not answered yet" (null) from "no" (false) — a radio group
  // with nothing selected yields formData.get() === null, which must not be
  // read as an implicit "no".
  const citizenshipAnswer = formData.get("isAustralianCitizen") as string | null;
  const isAustralianCitizen = citizenshipAnswer === null ? null : citizenshipAnswer === "yes";

  await prisma.application.update({
    where: { id: applicationId },
    data: { isAustralianCitizen },
  });

  await uploadIfPresent(applicationId, formData, "primaryId", "PRIMARY_ID");
  await uploadIfPresent(applicationId, formData, "secondaryId", "SECONDARY_ID");
  await uploadIfPresent(applicationId, formData, "visaGrantNotice", "VISA_GRANT_NOTICE");

  revalidatePath(`/apply/${applicationId}`, "layout");
  redirect(`/apply/${applicationId}/${nextApplicationStep("identity")}`);
}

export async function saveApplicationIncome(formData: FormData) {
  const dbUser = await requireUser();
  const applicationId = formData.get("applicationId") as string;
  await loadOwnedDraftApplication(dbUser.id, applicationId);

  const employmentStatusRaw = formData.get("employmentStatus") as string;

  await prisma.application.update({
    where: { id: applicationId },
    data: {
      employmentStatus: employmentStatusRaw ? (employmentStatusRaw as EmploymentStatus) : null,
      employerName: (formData.get("employerName") as string).trim(),
      employerContact: (formData.get("employerContact") as string).trim(),
    },
  });

  await uploadIfPresent(applicationId, formData, "proofOfIncome", "PROOF_OF_INCOME");
  await uploadIfPresent(applicationId, formData, "enrolmentConfirmation", "ENROLMENT_CONFIRMATION");

  revalidatePath(`/apply/${applicationId}`, "layout");
  redirect(`/apply/${applicationId}/${nextApplicationStep("income")}`);
}

export async function saveApplicationReferences(formData: FormData) {
  const dbUser = await requireUser();
  const applicationId = formData.get("applicationId") as string;
  await loadOwnedDraftApplication(dbUser.id, applicationId);

  await prisma.application.update({
    where: { id: applicationId },
    data: {
      previousAddress: (formData.get("previousAddress") as string).trim(),
      landlordContact: (formData.get("landlordContact") as string).trim(),
      reasonForLeaving: (formData.get("reasonForLeaving") as string).trim(),
      reference1Name: (formData.get("reference1Name") as string).trim(),
      reference1Phone: (formData.get("reference1Phone") as string).trim(),
      reference1Email: (formData.get("reference1Email") as string).trim(),
      reference2Name: (formData.get("reference2Name") as string).trim(),
      reference2Phone: (formData.get("reference2Phone") as string).trim(),
      reference2Email: (formData.get("reference2Email") as string).trim(),
      aboutMe: (formData.get("aboutMe") as string).trim(),
    },
  });

  revalidatePath(`/apply/${applicationId}`, "layout");
  redirect(`/apply/${applicationId}/${nextApplicationStep("references")}`);
}

export async function submitApplication(formData: FormData) {
  const dbUser = await requireUser();
  const applicationId = formData.get("applicationId") as string;
  const application = await loadOwnedDraftApplication(dbUser.id, applicationId);

  const documents = await prisma.applicationDocument.findMany({ where: { applicationId } });
  const hasDocument = (type: ApplicationDocumentType) => documents.some((doc) => doc.type === type);

  const missingPersonalDetails =
    !application.legalFirstName ||
    !application.legalLastName ||
    !application.dateOfBirth ||
    !application.phone ||
    !application.email ||
    !application.currentAddress ||
    !application.preferredMoveIn ||
    !application.intendedStayMonths;

  const missingIdentity =
    application.isAustralianCitizen === null ||
    !hasDocument("PRIMARY_ID") ||
    (application.isAustralianCitizen === false && !hasDocument("VISA_GRANT_NOTICE"));

  const missingIncome =
    !application.employmentStatus ||
    (application.employmentStatus === "STUDENT"
      ? !hasDocument("ENROLMENT_CONFIRMATION")
      : !hasDocument("PROOF_OF_INCOME"));

  const missingReferences =
    !application.reference1Name || !application.reference1Phone || !application.reference1Email;

  if (missingPersonalDetails || missingIdentity || missingIncome || missingReferences) {
    redirect(`/apply/${applicationId}/review?error=incomplete`);
  }

  await prisma.application.update({
    where: { id: applicationId },
    data: { status: "SUBMITTED", submittedAt: new Date() },
  });

  revalidatePath(`/apply/${applicationId}`, "layout");
  revalidatePath("/account/applications");
  redirect(`/account/applications/${applicationId}`);
}
