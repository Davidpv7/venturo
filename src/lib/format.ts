const currency = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 0,
});

export function formatCurrency(cents: number) {
  return currency.format(cents / 100);
}

export function formatWeeklyPrice(priceInCents: number) {
  return `${formatCurrency(priceInCents)}/week`;
}

export function formatFullName(user: { name: string | null; lastName: string | null }) {
  const fullName = [user.name, user.lastName].filter(Boolean).join(" ");
  return fullName || null;
}
