import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CustomerForm from "@/components/CustomerForm";
import CustomerTable from "@/components/CustomerTable";
import { Customer } from "@prisma/client";
import Navbar from "@/components/Navbar";

// 🔑 Safe version of Customer
export type SafeCustomer = Omit<
  Customer,
  | "initialDebt"
  | "adjustmentAmount"
  | "balanceAfterAdjustment"
  | "adjustmentStartDate"
  | "avgConsumption"
  | "totalConsumption"
  | "avgBilledAmount"
  | "defaultCapUnit"
  | "proposedAdjustment"
  | "finalAdjustment"
  | "resultantBillingAmount"
  | "currentTotalAmount"
  | "pictureReadingDate"
  | "lastReadDate"
  | "previousAdjustment"
  | "adjustmentEndDate"
  | "createdAt"
  | "updatedAt"
> & {
  initialDebt: number | null;
  adjustmentAmount: number | null;
  avgConsumption: number | null;
  totalConsumption: number | null;
  avgBilledAmount: number | null;
  defaultCapUnit: number | null;
  proposedAdjustment: number | null;
  finalAdjustment: number | null;
  resultantBillingAmount: number | null;
  currentTotalAmount: number | null;
  pictureReadingDate: string | null;
  lastReadDate: string | null;
  previousAdjustment: number | null;
  balanceAfterAdjustment: number | null;
  adjustmentStartDate: string | null;
  adjustmentEndDate: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: { username: string } | null;
};

// ✅ Convert Prisma → SafeCustomer
export function toSafeCustomer(
  item: Customer & { createdBy?: { username: string } | null }
): SafeCustomer {
  return {
    ...item,
    initialDebt: item.initialDebt ? Number(item.initialDebt) : null,
    adjustmentAmount: item.adjustmentAmount ? Number(item.adjustmentAmount) : null,
    avgConsumption: item.avgConsumption ? Number(item.avgConsumption) : null,
    totalConsumption: item.totalConsumption ? Number(item.totalConsumption) : null,
    avgBilledAmount: item.avgBilledAmount ? Number(item.avgBilledAmount) : null,
    defaultCapUnit: item.defaultCapUnit ? Number(item.defaultCapUnit) : null,
    proposedAdjustment: item.proposedAdjustment ? Number(item.proposedAdjustment) : null,
    finalAdjustment: item.finalAdjustment ? Number(item.finalAdjustment) : null,
    resultantBillingAmount: item.resultantBillingAmount ? Number(item.resultantBillingAmount) : null,
    currentTotalAmount: item.currentTotalAmount ? Number(item.currentTotalAmount) : null,
    pictureReadingDate: item.pictureReadingDate ? item.pictureReadingDate.toISOString() : null,
    lastReadDate: item.lastReadDate  ? item.lastReadDate.toISOString() : null,
    previousAdjustment: item.previousAdjustment ? Number(item.previousAdjustment) : null,
    balanceAfterAdjustment: item.balanceAfterAdjustment
      ? Number(item.balanceAfterAdjustment)
      : null,
    adjustmentStartDate: item.adjustmentStartDate
      ? item.adjustmentStartDate.toISOString()
      : null,
    adjustmentEndDate: item.adjustmentEndDate
      ? item.adjustmentEndDate.toISOString()
      : null,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    createdBy: item.createdBy ?? null,
  };
}


function toSafeCustomers(items: (Customer & { createdBy?: { username: string } | null })[]): SafeCustomer[] {
  return items.map(toSafeCustomer);
}

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return <div className="card">Unauthorized</div>;
  }

  const userId = (session as any).user.id;

  // ✅ only fetch customers created by this user
  const items = await prisma.customer.findMany({
    where: {
      createdById: Number(userId),
    },
    orderBy: { createdAt: "desc" },
    include: { createdBy: { select: { username: true } } },
  });

  const safeItems = toSafeCustomers(items);

  return (
    <div className="ml-55 w-4/5">
     
      {/* ✅ just pass the data, no need to filter by role */}
      <CustomerTable data={safeItems} role={"CCRO"} />
    </div>
  );
}
