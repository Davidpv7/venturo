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

export function countWords(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

export function truncateToWords(value: string, maxWords: number) {
  const words = value.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return value;
  return words.slice(0, maxWords).join(" ");
}

// For <input type="date"> defaultValue. Built from UTC getters rather than
// toISOString().slice(0, 10) — that shifts by a day depending on the
// stored time-of-day vs. local rendering, which matters near midnight
// AEST/AEDT.
export function toDateInputValue(date: Date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
