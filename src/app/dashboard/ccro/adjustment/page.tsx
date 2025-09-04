import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CustomerForm from "@/components/CustomerForm";
import CustomerTable from "@/components/CustomerTable";
import { Customer } from "@prisma/client";
import Navbar from "@/components/Navbar";

// ---------- SafeCustomer Type ----------
type SafeCustomer = Omit<
  Customer,
  | "initialDebt"
  | "adjustmentAmount"
  | "balanceAfterAdjustment"
  | "adjustmentStartDate"
  | "adjustmentEndDate"
  | "createdAt"
  | "updatedAt"
> & {
  initialDebt: number | null;
  adjustmentAmount: number | null;
  balanceAfterAdjustment: number | null;
  adjustmentStartDate: string | null;
  adjustmentEndDate: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: { username: string } | null;
};

// ---------- Utility Functions ----------
function toSafeCustomer(item: Customer & { createdBy?: { username: string } | null }): SafeCustomer {
  return {
    ...item,
    initialDebt: item.initialDebt ? Number(item.initialDebt) : null,
    adjustmentAmount: item.adjustmentAmount ? Number(item.adjustmentAmount) : null,
    balanceAfterAdjustment: item.balanceAfterAdjustment ? Number(item.balanceAfterAdjustment) : null,
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
    <div className="space-y-6">
      <CustomerForm />
      {/* ✅ just pass the data, no need to filter by role */}
      
    </div>
  );
}
