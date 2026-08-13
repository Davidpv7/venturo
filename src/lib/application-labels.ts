import type { EmploymentStatus, ApplicationDocumentType } from "@/generated/prisma/client";

export const EMPLOYMENT_STATUS_LABEL: Record<EmploymentStatus, string> = {
  EMPLOYED_FULL_TIME: "Employed — full time",
  EMPLOYED_PART_TIME: "Employed — part time",
  SELF_EMPLOYED: "Self-employed",
  STUDENT: "Student",
  UNEMPLOYED: "Unemployed",
  OTHER: "Other",
};

export const APPLICATION_DOCUMENT_TYPE_LABEL: Record<ApplicationDocumentType, string> = {
  PRIMARY_ID: "Primary ID (passport or driver's licence)",
  SECONDARY_ID: "Secondary ID",
  VISA_GRANT_NOTICE: "Visa grant notice",
  PROOF_OF_INCOME: "Proof of income",
  ENROLMENT_CONFIRMATION: "Enrolment confirmation",
};
