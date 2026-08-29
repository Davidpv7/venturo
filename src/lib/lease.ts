export function getLeaseEndDate(agreedAt: Date, leaseLengthMonths: number) {
  const end = new Date(agreedAt);
  end.setMonth(end.getMonth() + leaseLengthMonths);
  return end;
}

export function getDaysRemaining(endDate: Date) {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.ceil((endDate.getTime() - Date.now()) / msPerDay);
}

export function isLeaseActive(contract: {
  endedAt: Date | null;
  agreedAt: Date;
  leaseLengthMonths: number;
}) {
  if (contract.endedAt != null) return false;
  return getLeaseEndDate(contract.agreedAt, contract.leaseLengthMonths) > new Date();
}
