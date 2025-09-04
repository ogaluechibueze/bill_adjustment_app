// utils/billing.ts
type UsageRecord = {
  date: string; // "2025-08-01"
  kwh: number;
};

export function calculateBill(
  usageRecords: UsageRecord[],
  tariff: any
): number {
  let totalBill = 0;

  switch (tariff.type) {
    case "flat":
      totalBill = usageRecords.reduce((sum, u) => sum + u.kwh * tariff.rate, 0);
      break;

    case "tiered":
      totalBill = usageRecords.reduce((sum, u) => {
        let remaining = u.kwh;
        let cost = 0;

        for (let tier of tariff.tiers) {
          if (tier.limit) {
            const used = Math.min(remaining, tier.limit);
            cost += used * tier.rate;
            remaining -= used;
          } else {
            cost += remaining * tier.rate;
            break;
          }
        }
        return sum + cost;
      }, 0);
      break;

    case "timeOfUse":
      totalBill = usageRecords.reduce((sum, u) => {
        const hour = new Date(u.date).getHours();
        const isPeak = hour >= 18 && hour <= 22; // 6pm–10pm peak
        return sum + u.kwh * (isPeak ? tariff.peakRate : tariff.offPeakRate);
      }, 0);
      break;
  }

  return totalBill;
}
