import CustomerTable from "@/components/CustomerTable";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session || (session as any).user.role !== "HCC") {
    return <div className="card">Head Customer Care Unit Dashboard</div>;
  }

  const items = await prisma.customer.findMany({
    where: { approvalStage: "HCC", status: "Pending" },
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
      <CustomerTable data={safeItems} role="HCC" />
    </div>
  );
}
