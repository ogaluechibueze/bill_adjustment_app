"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FileText,
  Users,
  ClipboardList,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard/ccro", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/ccro/adjustment", label: "Customer Adjustment", icon: Users },
    { href: "/dashboard/ccro/capture", label: "Capture Customer", icon: ClipboardList },
    { href: "/dashboard/ccro/reports", label: "View Report", icon: FileText },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50  border-b bg-white/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto flex items-center justify-between py-3 px-50">
         <Link href="/dashboard/ccro" className="flex items-center gap-2">
          <LayoutDashboard className="h-6 w-6 text-blue-600" />
          <span className="font-semibold text-lg text-gray-800">
            Billing Adjustment App
          </span>
        </Link>

        {/* Nav Links (aligned right) */}
        <div className="hidden md:flex items-center gap-2 ml-auto">
          {links.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}>
              <Button
                variant={pathname === href ? "default" : "ghost"}
                className={cn(
                  "flex items-center gap-2 text-sm rounded-xl px-4",
                  pathname === href
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
