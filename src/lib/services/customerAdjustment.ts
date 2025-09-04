import { prisma } from "@/lib/prisma";

/**
 * Compute and update adjustmentAmount for a given customer
 */
export async function computeAndUpdateAdjustmentAmount(customerId: number) {
  // 1. Fetch the customer
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
  });

  if (!customer) throw new Error("Customer not found");
  if (!customer.feederName || !customer.band) {
    throw new Error("Customer must have feederName and band defined");
  }
  if (!customer.adjustmentStartDate || !customer.adjustmentEndDate) {
    throw new Error("Customer must have adjustmentStartDate and adjustmentEndDate");
  }

  const { feederName, band, adjustmentStartDate, adjustmentEndDate } = customer;

  // 2. Build list of months between start and end date
  const months: { month: number; year: number }[] = [];
  let current = new Date(adjustmentStartDate);
  const end = new Date(adjustmentEndDate);

  while (current <= end) {
    months.push({ month: current.getMonth() + 1, year: current.getFullYear() });
    current.setMonth(current.getMonth() + 1);
  }

  let totalAdjustment = 0;

  // 3. Loop through months and calculate adjustment
  for (const { month, year } of months) {
    const consumption = await prisma.feederConsumption.findFirst({
      where: { feederName, month, year },
    });

    const tariff = await prisma.tariff.findFirst({
      where: { feederName, band, month, year },
    });

    if (consumption && tariff) {
      const amount = consumption.consumption * tariff.rate * 1.075;
      totalAdjustment += amount;
    }
  }

  // 4. Update customer with computed adjustmentAmount
  const updatedCustomer = await prisma.customer.update({
    where: { id: customerId },
    data: {
      adjustmentAmount: totalAdjustment,
    },
  });

  return updatedCustomer;
}
