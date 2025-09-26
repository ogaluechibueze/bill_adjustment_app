import CustomerTable from "@/components/CustomerTable";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export default async function Page() {
  const session = await getServerSession(authOptions);

  // ✅ Allow only BM role
  if (!session || session.user.role !== "RH") {
    return <div className="card">Unauthorized</div>;
  }

  const userRegion = session.user.region;
  const userBusinessUnit = session.user.businessUnit;

  // ✅ If RH has no region → show empty state
  if (!userRegion) {
    return (
      <div className="ml-55 w-4/5 pt-12">
        <h2 className="text-xl font-bold mb-4">Regional Head Dashboard</h2>
        <p className="text-gray-500">No customers assigned to your region or business unit.</p>
      </div>
    );
  }

  // ✅ Fetch only BM-approval customers in the same region + business unit
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

  const safeItems = JSON.parse(JSON.stringify(items));

  return (
    <div className="ml-55 w-4/5 pt-12"> 
      <h2 className="text-xl font-bold mb-4">Regional Head Dashboard</h2>
      <CustomerTable data={safeItems} role="RH" />
    </div>
  );
}
