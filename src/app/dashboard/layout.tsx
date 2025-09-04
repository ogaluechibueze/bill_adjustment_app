import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import Sidebar from "@/components/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const role = (session as any)?.user?.role as string | undefined;

  return (
    <div className="min-h-screen flex bg-gray-50 ml-5">
      {/* Sidebar with top spacing */}
      <div className="pt-25">
        <Sidebar role={role} />
      </div>

      {/* Main content stays aligned */}
      <main className="flex-1 p-6 overflow-y-auto">
        <Card className="p-6 shadow-sm bg-white">{children}</Card>
      </main>
    </div>
  );
}
