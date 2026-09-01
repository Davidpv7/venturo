"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireVerifiedUser } from "@/lib/require-verified-user";
import { uploadApplicationDocument, deleteApplicationDocuments } from "@/lib/application-documents";
import { nextApplicationStep, type ApplicationStep } from "@/lib/application-steps";
import { allowedLeaseLengths } from "@/lib/lease-lengths";
import { sendEmail, applicationSubmittedEmail, newApplicationAdminEmail, getAdminEmails } from "@/lib/email";
import type { ApplicationDocumentType, EmploymentStatus } from "@/generated/prisma/client";

// Every step-save action re-checks ownership and draft status itself, not
// just relying on the layout guard — Server Actions are directly callable
// once deployed (see src/lib/require-admin.ts's comment on the same rule).
async function loadOwnedDraftApplication(dbUserId: string, applicationId: string) {
  const application = await prisma.application.findUniqueOrThrow({
    where: { id: applicationId },
    include: { room: { include: { home: true } } },
  });
  if (application.userId !== dbUserId || application.status !== "DRAFT") {
    redirect(`/account/applications/${applicationId}`);
  }
  return application;
}

async function uploadIfPresent(
  applicationId: string,
  step: ApplicationStep,
  formData: FormData,
  fieldName: string,
  type: ApplicationDocumentType,
) {
  const file = formData.get(fieldName);
  if (file instanceof File && file.size > 0) {
    try {
      await uploadApplicationDocument(applicationId, type, file);
    } catch (err) {
      const message = err instanceof Error ? err.message : "That file couldn't be uploaded.";
      redirect(`/apply/${applicationId}/${step}?error=upload-failed&detail=${encodeURIComponent(message)}`);
    }
    return true;
  }
  return false;
}

export async function saveApplicationPersonal(formData: FormData) {
  const dbUser = await requireVerifiedUser();
  const applicationId = formData.get("applicationId") as string;
  const application = await loadOwnedDraftApplication(dbUser.id, applicationId);

  const dateOfBirth = formData.get("dateOfBirth") as string;
  const preferredMoveIn = formData.get("preferredMoveIn") as string;
  const intendedStayMonths = parseInt(formData.get("intendedStayMonths") as string, 10);

  const roomOptions = allowedLeaseLengths(application.room);
  if (!roomOptions.includes(intendedStayMonths as (typeof roomOptions)[number])) {
    redirect(`/apply/${applicationId}/personal?error=invalid-lease-length`);
  }

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
      intendedStayMonths,
    },
  });

  revalidatePath(`/apply/${applicationId}`, "layout");
  redirect(`/apply/${applicationId}/${nextApplicationStep("personal")}`);
}

export async function saveApplicationIdentity(formData: FormData) {
  const dbUser = await requireVerifiedUser();
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

  const uploadedPrimary = await uploadIfPresent(applicationId, "identity", formData, "primaryId", "PRIMARY_ID");
  const uploadedSecondary = await uploadIfPresent(applicationId, "identity", formData, "secondaryId", "SECONDARY_ID");

  revalidatePath(`/apply/${applicationId}`, "layout");
  const suffix = uploadedPrimary || uploadedSecondary ? "?success=uploaded" : "";
  redirect(`/apply/${applicationId}/${nextApplicationStep("identity")}${suffix}`);
}

export async function saveApplicationIncome(formData: FormData) {
  const dbUser = await requireVerifiedUser();
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

  const uploadedIncome = await uploadIfPresent(applicationId, "income", formData, "proofOfIncome", "PROOF_OF_INCOME");
  const uploadedEnrolment = await uploadIfPresent(
    applicationId,
    "income",
    formData,
    "enrolmentConfirmation",
    "ENROLMENT_CONFIRMATION",
  );

  revalidatePath(`/apply/${applicationId}`, "layout");
  const suffix = uploadedIncome || uploadedEnrolment ? "?success=uploaded" : "";
  redirect(`/apply/${applicationId}/${nextApplicationStep("income")}${suffix}`);
}

export async function saveApplicationReferences(formData: FormData) {
  const dbUser = await requireVerifiedUser();
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

export async function deleteApplication(formData: FormData) {
  const dbUser = await requireVerifiedUser();
  const applicationId = formData.get("applicationId") as string;
  // Only draft applications can be deleted this way — once submitted, an
  // admin is reviewing it (rejectApplication already has its own deletion
  // path via the cleanup cron).
  await loadOwnedDraftApplication(dbUser.id, applicationId);

  // Same ordering as cleanupRejectedApplications: no onDelete: Cascade in
  // the schema, so documents (DB rows + Storage objects) must go first.
  await deleteApplicationDocuments(applicationId);
  await prisma.application.delete({ where: { id: applicationId } });

  revalidatePath("/account/applications");
  redirect("/account/applications");
}

export async function submitApplication(formData: FormData) {
  const dbUser = await requireVerifiedUser();
  const applicationId = formData.get("applicationId") as string;
  const application = await loadOwnedDraftApplication(dbUser.id, applicationId);

  const documents = await prisma.applicationDocument.findMany({ where: { applicationId } });
  const hasDocument = (type: ApplicationDocumentType) => documents.some((doc) => doc.type === type);

  const missing: string[] = [];

  if (!application.legalFirstName) missing.push("Legal first name");
  if (!application.legalLastName) missing.push("Legal last name");
  if (!application.dateOfBirth) missing.push("Date of birth");
  if (!application.phone) missing.push("Phone");
  if (!application.email) missing.push("Email");
  if (!application.currentAddress) missing.push("Current address");
  if (!application.preferredMoveIn) missing.push("Preferred move-in date");
  if (!application.intendedStayMonths) missing.push("Lease length");

  if (application.isAustralianCitizen === null) {
    missing.push("Australian citizen / permanent resident answer");
  }
  if (!hasDocument("PRIMARY_ID")) missing.push("Primary ID upload");

  if (!application.employmentStatus) missing.push("Employment status");

  if (!application.reference1Name) missing.push("Reference 1 name");
  if (!application.reference1Phone) missing.push("Reference 1 phone");
  if (!application.reference1Email) missing.push("Reference 1 email");

  if (missing.length > 0) {
    redirect(
      `/apply/${applicationId}/review?error=incomplete&missing=${encodeURIComponent(missing.join("|"))}`,
    );
  }

  await prisma.application.update({
    where: { id: applicationId },
    data: { status: "SUBMITTED", submittedAt: new Date() },
  });

  revalidatePath(`/apply/${applicationId}`, "layout");
  revalidatePath("/account/applications");

  const applicantName = `${application.legalFirstName} ${application.legalLastName}`.trim() || dbUser.name || "Applicant";

  const submitted = applicationSubmittedEmail(application.room.title, application.room.home.name);
  await sendEmail({ to: dbUser.email, ...submitted });

  const adminAlert = newApplicationAdminEmail(applicantName, application.room.title, application.room.home.name, applicationId);
  await sendEmail({ to: await getAdminEmails(), ...adminAlert, replyTo: dbUser.email });

  redirect(`/account/applications/${applicationId}`);
}
