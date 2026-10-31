export function applySellingPrice(item, result) {
  const pricing = item.pricing || { mode: "auto", rate: 0 };
  const billableArea =
    ((item.width +
      (item.design?.shape === "corner" ? item.design.returnWidth : 0)) *
      item.height) /
    1e6;
  if (pricing.mode === "auto")
    return { ...result, billableArea, pricingMode: "auto" };
  const unitPrice =
    Math.round(
      (pricing.mode === "area" ? billableArea * pricing.rate : pricing.rate) *
        100,
    ) / 100;
  return {
    ...result,
    billableArea,
    pricingMode: pricing.mode,
    sellingRate: pricing.rate,
    estimatedPrice: result.totalPrice,
    unitPrice,
    totalPrice: unitPrice * item.quantity,
  };
}
export const quoteDefaults = {
  business: "FRAME WORKSHOP",
  phone: "",
  address: "",
  validUntil: "",
  depositLabel: "",
  deliveryLabel: "",
  balanceLabel: "",
  depositPercent: 50,
  deliveryPercent: 40,
};
export function paymentSchedule(total, quote = {}) {
  const q = { ...quoteDefaults, ...quote };
  const first = Math.round(total * q.depositPercent) / 100;
  const second = Math.round(total * q.deliveryPercent) / 100;
  return [
    { label: q.depositLabel, percent: q.depositPercent, amount: first },
    { label: q.deliveryLabel, percent: q.deliveryPercent, amount: second },
    {
      label: q.balanceLabel,
      percent: 100 - q.depositPercent - q.deliveryPercent,
      amount: Math.round((total - first - second) * 100) / 100,
    },
  ];
}
