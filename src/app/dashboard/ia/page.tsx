import CustomerTable from "@/components/CustomerTable";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session || (session as any).user.role !== "IA") {
    return <div className="card">Internal Auditor Dashboard</div>;
  }

  const items = await prisma.customer.findMany({
    where: { approvalStage: "IA", status: "Pending" },
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: { select: { username: true } },
    },
  });

  // 🔑 Convert Prisma objects (Decimal, Date, etc.) → plain JSON
  const safeItems = JSON.parse(JSON.stringify(items));

  return (
    <div className="ml-55 w-4/5 pt-12"> 
      {/* ml-6 = move right a bit, w-4/5 = 80% width */}
      <CustomerTable data={safeItems} role="IA" />
    </div>
  );
}
