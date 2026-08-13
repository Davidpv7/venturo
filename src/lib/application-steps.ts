export const APPLICATION_STEPS = ["personal", "identity", "income", "references", "review"] as const;
export type ApplicationStep = (typeof APPLICATION_STEPS)[number];

export const APPLICATION_STEP_LABEL: Record<ApplicationStep, string> = {
  personal: "Personal details",
  identity: "Identity verification",
  income: "Income & employment",
  references: "Rental history & references",
  review: "Review",
};

export function isApplicationStep(value: string): value is ApplicationStep {
  return (APPLICATION_STEPS as readonly string[]).includes(value);
}

export function nextApplicationStep(step: ApplicationStep): ApplicationStep {
  const index = APPLICATION_STEPS.indexOf(step);
  return APPLICATION_STEPS[index + 1] ?? "review";
}
