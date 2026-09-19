const DISCOUNT_TIERS = [
  { minQuantity: 300000, percent: 15 },
  { minQuantity: 50000, percent: 10 },
  { minQuantity: 10000, percent: 5 },
  { minQuantity: 0, percent: 0 },
];

export function calculatePartnerDiscount(totalQuantity) {
  if (!Number.isInteger(totalQuantity) || totalQuantity < 0) {
    throw new RangeError('totalQuantity must be a non-negative integer');
  }
  const tier = DISCOUNT_TIERS.find((item) => totalQuantity >= item.minQuantity);
  return tier.percent;
}
