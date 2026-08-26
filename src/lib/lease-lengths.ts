export const LEASE_LENGTH_OPTIONS = [3, 6, 12] as const;

export type LeaseLengthMonths = (typeof LEASE_LENGTH_OPTIONS)[number];

export function allowedLeaseLengths(room: {
  leaseLength3Months: boolean;
  leaseLength6Months: boolean;
  leaseLength12Months: boolean;
}): LeaseLengthMonths[] {
  return LEASE_LENGTH_OPTIONS.filter(
    (months) =>
      (months === 3 && room.leaseLength3Months) ||
      (months === 6 && room.leaseLength6Months) ||
      (months === 12 && room.leaseLength12Months),
  );
}

export function formatLeaseLengthOptions(months: LeaseLengthMonths[]): string {
  if (months.length === 0) return "";
  if (months.length === 1) return `${months[0]} month lease`;
  if (months.length === 2) return `${months[0]} or ${months[1]} month lease options`;
  return `${months.slice(0, -1).join(", ")} or ${months[months.length - 1]} month lease options`;
}
