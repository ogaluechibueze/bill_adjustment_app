"use client";

import Link from "next/link";
import { LayoutDashboard, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import LogoutButton from "@/components/LogoutButton";

interface SidebarProps {
  role?: string;
}

const roleRoutes: Record<string, string> = {
  CCRO: "/dashboard/ccro",
  CCO: "/dashboard/cco",
  CAO: "/dashboard/cao",
  MD: "/dashboard/md",
};

export default function Sidebar({ role }: SidebarProps) {
  const allowedRoute = role ? roleRoutes[role] : null;

  return (
    <aside className="fixed w-60 bg-white border-r shadow-sm flex flex-col">
      {/* Top Logo / Title */}
      <div className="px-6 py-4 border-b">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5 text-blue-600" />
          Dashboard
        </h2>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {allowedRoute && (
          <Link href={allowedRoute}>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-gray-700 hover:bg-gray-100"
            >
              <User className="w-4 h-4" />
              {role}
            </Button>
          </Link>
        )}
      </nav>

      {/* Bottom Section */}
      <div className="px-4 py-6 border-t space-y-4">
        <div className="text-xs text-gray-500">
          Signed in as: <b>{role ?? "Guest"}</b>
        </div>
        <LogoutButton />
      </div>
    </aside>
  );
}
