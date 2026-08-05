const currency = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 0,
});

export function formatWeeklyPrice(priceInCents: number) {
  return `${currency.format(priceInCents / 100)}/week`;
}
