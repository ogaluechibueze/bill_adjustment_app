"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Users,
  ClipboardList,
  Menu,
  X,
  HomeIcon,
  Home,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: "/dashboard/ccro", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/ccro/adjustment", label: "Unmetered Customer", icon: Users },
    { href: "/dashboard/ccro/capture", label: "Metered Customer", icon: ClipboardList },
    { href: "/dashboard/ccro/reports", label: "View Report", icon: FileText },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md">
      <div className="container mx-auto flex items-center justify-end py-3 px-10 md:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
        <HomeIcon className="h-6 w-6 text-white" />
          <span className="font-bold text-lg tracking-wide">
            HOME
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-3 ml-auto">
          {links.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}>
              <Button
                variant="ghost"
                className={cn(
                  "flex items-center gap-2 text-sm rounded-full px-4 transition-all duration-300",
                  pathname === href
                    ? "bg-white text-blue-700 shadow-lg"
                    : "text-white hover:bg-white/20 hover:shadow"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Button>
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-white/20"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white text-gray-800 shadow-md">
          <div className="flex flex-col space-y-2 p-4">
            {links.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} onClick={() => setMenuOpen(false)}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-4 py-2 rounded-lg transition-all",
                    pathname === href
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-100"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
