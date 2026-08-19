import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireVerifiedUser } from "@/lib/require-verified-user";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, inputClasses } from "@/components/ui/field";
import { isApplicationStep } from "@/lib/application-steps";
import { EMPLOYMENT_STATUS_LABEL, APPLICATION_DOCUMENT_TYPE_LABEL } from "@/lib/application-labels";
import {
  saveApplicationPersonal,
  saveApplicationIdentity,
  saveApplicationIncome,
  saveApplicationReferences,
  submitApplication,
} from "./actions";
import type { Application, ApplicationDocument } from "@/generated/prisma/client";

type ApplicationWithDocuments = Application & { documents: ApplicationDocument[] };

function toDateInputValue(date: Date | null) {
  return date ? date.toISOString().slice(0, 10) : "";
}

export default async function ApplicationStepPage({
  params,
  searchParams,
}: {
  params: Promise<{ applicationId: string; step: string }>;
  searchParams: Promise<{ error?: string; missing?: string }>;
}) {
  const dbUser = await requireVerifiedUser();
  const { applicationId, step } = await params;
  const { error, missing } = await searchParams;

  if (!isApplicationStep(step)) notFound();

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { documents: true },
  });
  if (!application || application.userId !== dbUser.id) notFound();

  return (
    <Card>
      {error === "incomplete" && (
        <div className="mb-6 rounded-md bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <p>Please complete the following before submitting:</p>
          {missing && (
            <ul className="mt-2 list-inside list-disc">
              {missing.split("|").map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {step === "personal" && <PersonalStep application={application} />}
      {step === "identity" && <IdentityStep application={application} />}
      {step === "income" && <IncomeStep application={application} />}
      {step === "references" && <ReferencesStep application={application} />}
      {step === "review" && <ReviewStep application={application} />}
    </Card>
  );
}

function StepHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      <p className="mt-1 text-sm text-foreground/60">{description}</p>
    </div>
  );
}

function PersonalStep({ application }: { application: ApplicationWithDocuments }) {
  return (
    <>
      <StepHeading
        title="Personal details"
        description="Tell us a bit about yourself."
      />
      <form action={saveApplicationPersonal} className="flex flex-col gap-4">
        <input type="hidden" name="applicationId" value={application.id} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Legal first name">
            <input
              name="legalFirstName"
              type="text"
              required
              defaultValue={application.legalFirstName ?? ""}
              className={inputClasses}
            />
          </Field>
          <Field label="Legal last name">
            <input
              name="legalLastName"
              type="text"
              required
              defaultValue={application.legalLastName ?? ""}
              className={inputClasses}
            />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Date of birth">
            <input
              name="dateOfBirth"
              type="date"
              required
              defaultValue={toDateInputValue(application.dateOfBirth)}
              className={inputClasses}
            />
          </Field>
          <Field label="Phone">
            <input
              name="phone"
              type="tel"
              required
              defaultValue={application.phone ?? ""}
              className={inputClasses}
            />
          </Field>
        </div>
        <Field label="Email">
          <input
            name="email"
            type="email"
            required
            defaultValue={application.email ?? ""}
            className={inputClasses}
          />
        </Field>
        <Field label="Current address">
          <input
            name="currentAddress"
            type="text"
            required
            defaultValue={application.currentAddress ?? ""}
            className={inputClasses}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Preferred move-in date">
            <input
              name="preferredMoveIn"
              type="date"
              required
              defaultValue={toDateInputValue(application.preferredMoveIn)}
              className={inputClasses}
            />
          </Field>
          <Field label="Intended length of stay (months)">
            <input
              name="intendedStayMonths"
              type="number"
              min={1}
              required
              defaultValue={application.intendedStayMonths ?? ""}
              className={inputClasses}
            />
          </Field>
        </div>
        <Button type="submit" className="mt-2 self-start">
          Save &amp; Continue
        </Button>
      </form>
    </>
  );
}

function ExistingDocumentNote({
  application,
  type,
}: {
  application: ApplicationWithDocuments;
  type: ApplicationDocument["type"];
}) {
  const doc = application.documents.find((d) => d.type === type);
  if (!doc) return null;
  return (
    <p className="text-xs text-venturo-olive">Uploaded: {doc.fileName} — choose a new file to replace it.</p>
  );
}

function IdentityStep({ application }: { application: ApplicationWithDocuments }) {
  return (
    <>
      <StepHeading
        title="Identity verification"
        description="Upload a primary photo ID. A secondary ID is optional. If you're not an Australian citizen or permanent resident, also upload your visa grant notice."
      />
      <form action={saveApplicationIdentity} className="flex flex-col gap-5">
        <input type="hidden" name="applicationId" value={application.id} />

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-foreground">
            Are you an Australian citizen or permanent resident?
          </legend>
          <div className="flex gap-4 text-sm text-foreground/80">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="isAustralianCitizen"
                value="yes"
                defaultChecked={application.isAustralianCitizen === true}
                className="h-4 w-4 accent-venturo-olive"
              />
              Yes
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="isAustralianCitizen"
                value="no"
                defaultChecked={application.isAustralianCitizen === false}
                className="h-4 w-4 accent-venturo-olive"
              />
              No
            </label>
          </div>
        </fieldset>

        <Field label="Primary ID (passport or driver's licence)">
          <input
            name="primaryId"
            type="file"
            accept="application/pdf,image/jpeg,image/png"
            className={inputClasses}
          />
        </Field>
        <ExistingDocumentNote application={application} type="PRIMARY_ID" />

        <Field label="Secondary ID (optional)">
          <input
            name="secondaryId"
            type="file"
            accept="application/pdf,image/jpeg,image/png"
            className={inputClasses}
          />
        </Field>
        <ExistingDocumentNote application={application} type="SECONDARY_ID" />

        <Field label="Visa grant notice (if not a citizen/permanent resident)">
          <input
            name="visaGrantNotice"
            type="file"
            accept="application/pdf,image/jpeg,image/png"
            className={inputClasses}
          />
        </Field>
        <ExistingDocumentNote application={application} type="VISA_GRANT_NOTICE" />

        <Button type="submit" className="mt-2 self-start">
          Save &amp; Continue
        </Button>
      </form>
    </>
  );
}

function IncomeStep({ application }: { application: ApplicationWithDocuments }) {
  return (
    <>
      <StepHeading
        title="Income & employment"
        description="Upload a payslip or bank statement as proof of income — or, if you're a student, your enrolment confirmation."
      />
      <form action={saveApplicationIncome} className="flex flex-col gap-4">
        <input type="hidden" name="applicationId" value={application.id} />
        <Field label="Employment status">
          <select
            name="employmentStatus"
            required
            defaultValue={application.employmentStatus ?? ""}
            className={inputClasses}
          >
            <option value="" disabled>
              Select one
            </option>
            {Object.entries(EMPLOYMENT_STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Employer name">
            <input
              name="employerName"
              type="text"
              defaultValue={application.employerName ?? ""}
              className={inputClasses}
            />
          </Field>
          <Field label="Employer contact (phone or email)">
            <input
              name="employerContact"
              type="text"
              defaultValue={application.employerContact ?? ""}
              className={inputClasses}
            />
          </Field>
        </div>

        <Field label="Proof of income (payslip or bank statement)">
          <input
            name="proofOfIncome"
            type="file"
            accept="application/pdf,image/jpeg,image/png"
            className={inputClasses}
          />
        </Field>
        <ExistingDocumentNote application={application} type="PROOF_OF_INCOME" />

        <Field label="Enrolment confirmation (students only)">
          <input
            name="enrolmentConfirmation"
            type="file"
            accept="application/pdf,image/jpeg,image/png"
            className={inputClasses}
          />
        </Field>
        <ExistingDocumentNote application={application} type="ENROLMENT_CONFIRMATION" />

        <Button type="submit" className="mt-2 self-start">
          Save &amp; Continue
        </Button>
      </form>
    </>
  );
}

function ReferencesStep({ application }: { application: ApplicationWithDocuments }) {
  return (
    <>
      <StepHeading
        title="Rental history & references"
        description="Your previous address and one or two people we can contact as references."
      />
      <form action={saveApplicationReferences} className="flex flex-col gap-4">
        <input type="hidden" name="applicationId" value={application.id} />
        <Field label="Previous address">
          <input
            name="previousAddress"
            type="text"
            defaultValue={application.previousAddress ?? ""}
            className={inputClasses}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Landlord / agent contact">
            <input
              name="landlordContact"
              type="text"
              defaultValue={application.landlordContact ?? ""}
              className={inputClasses}
            />
          </Field>
          <Field label="Reason for leaving">
            <input
              name="reasonForLeaving"
              type="text"
              defaultValue={application.reasonForLeaving ?? ""}
              className={inputClasses}
            />
          </Field>
        </div>

        <div className="mt-2 border-t border-venturo-olive/15 pt-4">
          <h3 className="text-sm font-semibold text-foreground">Reference 1 (required)</h3>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            <Field label="Name">
              <input
                name="reference1Name"
                type="text"
                required
                defaultValue={application.reference1Name ?? ""}
                className={inputClasses}
              />
            </Field>
            <Field label="Phone">
              <input
                name="reference1Phone"
                type="tel"
                required
                defaultValue={application.reference1Phone ?? ""}
                className={inputClasses}
              />
            </Field>
            <Field label="Email">
              <input
                name="reference1Email"
                type="email"
                required
                defaultValue={application.reference1Email ?? ""}
                className={inputClasses}
              />
            </Field>
          </div>
        </div>

        <div className="border-t border-venturo-olive/15 pt-4">
          <h3 className="text-sm font-semibold text-foreground">Reference 2 (optional)</h3>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            <Field label="Name">
              <input
                name="reference2Name"
                type="text"
                defaultValue={application.reference2Name ?? ""}
                className={inputClasses}
              />
            </Field>
            <Field label="Phone">
              <input
                name="reference2Phone"
                type="tel"
                defaultValue={application.reference2Phone ?? ""}
                className={inputClasses}
              />
            </Field>
            <Field label="Email">
              <input
                name="reference2Email"
                type="email"
                defaultValue={application.reference2Email ?? ""}
                className={inputClasses}
              />
            </Field>
          </div>
        </div>

        <Field label="About me (optional)">
          <textarea
            name="aboutMe"
            rows={4}
            defaultValue={application.aboutMe ?? ""}
            className={inputClasses}
          />
        </Field>

        <Button type="submit" className="mt-2 self-start">
          Save &amp; Continue
        </Button>
      </form>
    </>
  );
}

function SummaryRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex flex-col gap-0.5 py-2 sm:flex-row sm:justify-between">
      <dt className="text-foreground/50">{label}</dt>
      <dd className="font-medium text-foreground sm:text-right">{value || "—"}</dd>
    </div>
  );
}

function ReviewStep({ application }: { application: ApplicationWithDocuments }) {
  const documentLabels = application.documents.map(
    (doc) => `${APPLICATION_DOCUMENT_TYPE_LABEL[doc.type]} (${doc.fileName})`,
  );

  return (
    <>
      <StepHeading
        title="Review your application"
        description="Check everything looks right before submitting."
      />
      <div className="flex flex-col gap-6">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Personal details</h3>
          <dl className="mt-2 divide-y divide-venturo-olive/10 text-sm">
            <SummaryRow
              label="Name"
              value={[application.legalFirstName, application.legalLastName].filter(Boolean).join(" ")}
            />
            <SummaryRow label="Date of birth" value={toDateInputValue(application.dateOfBirth)} />
            <SummaryRow label="Phone" value={application.phone} />
            <SummaryRow label="Email" value={application.email} />
            <SummaryRow label="Current address" value={application.currentAddress} />
            <SummaryRow label="Preferred move-in" value={toDateInputValue(application.preferredMoveIn)} />
            <SummaryRow
              label="Intended stay"
              value={application.intendedStayMonths ? `${application.intendedStayMonths} months` : null}
            />
          </dl>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground">Identity verification</h3>
          <dl className="mt-2 divide-y divide-venturo-olive/10 text-sm">
            <SummaryRow
              label="Australian citizen / PR"
              value={
                application.isAustralianCitizen === null
                  ? null
                  : application.isAustralianCitizen
                    ? "Yes"
                    : "No"
              }
            />
          </dl>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground">Income & employment</h3>
          <dl className="mt-2 divide-y divide-venturo-olive/10 text-sm">
            <SummaryRow
              label="Employment status"
              value={
                application.employmentStatus ? EMPLOYMENT_STATUS_LABEL[application.employmentStatus] : null
              }
            />
            <SummaryRow label="Employer" value={application.employerName} />
            <SummaryRow label="Employer contact" value={application.employerContact} />
          </dl>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground">Rental history & references</h3>
          <dl className="mt-2 divide-y divide-venturo-olive/10 text-sm">
            <SummaryRow label="Previous address" value={application.previousAddress} />
            <SummaryRow label="Landlord / agent contact" value={application.landlordContact} />
            <SummaryRow label="Reason for leaving" value={application.reasonForLeaving} />
            <SummaryRow
              label="Reference 1"
              value={[application.reference1Name, application.reference1Phone, application.reference1Email]
                .filter(Boolean)
                .join(" · ")}
            />
            <SummaryRow
              label="Reference 2"
              value={[application.reference2Name, application.reference2Phone, application.reference2Email]
                .filter(Boolean)
                .join(" · ")}
            />
            <SummaryRow label="About me" value={application.aboutMe} />
          </dl>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground">Uploaded documents</h3>
          {documentLabels.length === 0 ? (
            <p className="mt-2 text-sm text-foreground/60">No documents uploaded yet.</p>
          ) : (
            <ul className="mt-2 list-inside list-disc text-sm text-foreground/80">
              {documentLabels.map((label) => (
                <li key={label}>{label}</li>
              ))}
            </ul>
          )}
        </div>

        <form action={submitApplication} className="border-t border-venturo-olive/15 pt-6">
          <input type="hidden" name="applicationId" value={application.id} />
          <p className="mb-4 text-sm text-foreground/70">
            Once submitted, you won&apos;t be able to edit this application — we&apos;ll be in
            touch once it&apos;s been reviewed.
          </p>
          <Button type="submit">Submit Application</Button>
        </form>
      </div>
    </>
  );
}
