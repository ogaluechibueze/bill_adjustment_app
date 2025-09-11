import CustomerTable from "@/components/CustomerTable";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session || (session as any).user.role !== "RH") {
    return <div className="card">Regional Head Dashboard</div>;
  }

  const userRegion = (session as any).user.region;
  const userBusinessUnit = (session as any).user.businessUnit;

  const items = await prisma.customer.findMany({
    where: { 
      approvalStage: "RH", 
      status: "Pending",
      region: userRegion,                
    },
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: { select: { username: true } },
    },
  });

  // 🔑 Convert Prisma objects (Decimal, Date, etc.) → plain JSON
  const safeItems = JSON.parse(JSON.stringify(items));

  return (
    <div className="ml-55 w-4/5 pt-12"> 
      <CustomerTable data={safeItems} role="RH" />
    </div>
  );
}
