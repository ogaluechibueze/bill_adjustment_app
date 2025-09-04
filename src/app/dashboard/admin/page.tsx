import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import CustomerTable from "@/components/CustomerTable";
import UserTable from "@/components/UserTable"; // 🔑 New component

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session || (session as any).user.role !== "ADMIN") {
    return <div className="p-6">You must be an ADMIN to access this dashboard.</div>;
  }

  // Customers waiting for BM approval
  const items = await prisma.customer.findMany({
    where: { approvalStage: "BM", status: "Pending" },
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: { select: { username: true } },
    },
  });

  // All users
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  const safeItems = JSON.parse(JSON.stringify(items));
  const safeUsers = JSON.parse(JSON.stringify(users));

  return (
    <div className="ml-55 w-4/5 pt-12">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 gap-8">
        {/* Customers Section */}

        {/* Users Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Manage Users</h2>
          <UserTable data={safeUsers} />
        </div>
      </div>
    </div>
  );
}
