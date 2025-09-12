"use client";

import Link from "next/link";
import { LayoutDashboard, User, Menu, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import LogoutButton from "@/components/LogoutButton";
import Image from "next/image";
import { useState } from "react";
import { useSession } from "next-auth/react";

interface SidebarProps {
  role?: string;
}

const roleRoutes: Record<string, string> = {
  CCRO: "/dashboard/ccro",
  HCC: "/dashboard/hcc",
  BM: "/dashboard/bm",
  RH: "/dashboard/rh",
  RA: "/dashboard/ra",
  IA: "/dashboard/ia",
  CIA: "/dashboard/cia",
  MD: "/dashboard/md",
};

export default function Sidebar({ role }: SidebarProps) {
  const { data: session } = useSession();
  const allowedRoute = role ? roleRoutes[role] : null;
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="md:hidden fixed top-17 left-4 z-50 bg-blue-600 text-black p-2 rounded-lg shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-blue-600 to-indigo-700 text-white shadow-xl flex flex-col transform transition-transform duration-300 z-40
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {role !== "CCRO" ? (
          <div className="items-center text-center py-5">
            <Link href="/">
              <Button className="bg-transparent font-bold">
                <Home /> HOME
              </Button>
            </Link>
          </div>
        ) : null}

        {/* Top Logo / Title */}
        <div className="px-6 py-18 border-b border-white/20 flex flex-col items-center gap-2"> 
          <Image
            src="/logo2.png"
            alt="App Logo"
            width={200}
            height={200}
            className="rounded-full shadow-md"
          />
          <h2 className="mt-12 text-xl font-bold flex items-center gap-2">
            {role} Dashboard
          </h2>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-3">
          {allowedRoute && (
            <Link href={allowedRoute}>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-white hover:bg-white/20"
              >
                <User className="w-5 h-5" />
                {role}
              </Button>
            </Link>
          )}
          <Link href="#">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-white hover:bg-white/20"
            >
              📊 Reports
            </Button>
          </Link>
          <Link href="#">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-white hover:bg-white/20"
            >
              ⚙️ Settings
            </Button>
          </Link>
        </nav>

        {/* Bottom Section */}
        <div className="px-4 py-6 border-t border-white/20 space-y-4 text-sm">
          <div className="text-gray-200">
            Welcome{" "}
            <b>{session?.user?.username ?? session?.user?.email ?? "Guest"}</b>
          </div>
          <LogoutButton />
        </div>
      </aside>
    </>
  );
}
