"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [load, setLoad] = useState(false);
  const { data: session, status } = useSession();

  // ✅ Map roles → dashboard routes
  const roleRoutes: Record<string, string> = {
    BM: "dashboard/bm",
    CCRO: "dashboard/ccro",
    RH: "dashboard/rh",
    HCC: "dashboard/hcc",
    RA: "dashboard/ra",
    IA: "dashboard/ia",
    CIA: "dashboard/cia",
    MD: "dashboard/md",
  };

  const userRole = (session?.user as any)?.role;
  const dashboardRoute = userRole ? roleRoutes[userRole] ?? "/dashboard" : "/login";

  return (
    <main className="relative h-screen w-full overflow-hidden">
      {/* 🔹 Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/Customer.jpeg"
          alt="Background"
          fill
          priority
          className="object-cover"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* 🔹 Navbar */}
      <header className="absolute top-0 left-0 w-full z-20 px-8 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Image
            src="/logo2.png"
            alt="Logo"
            width={200}
            height={200}
            className="rounded-md"
          />
        </div>

        {/* Right side */}
        <Link href={dashboardRoute}>
          <Button onClick={() => setLoading(true)}
            variant="outline"
            className="bg-white/20 hover:bg-white/30 text-white border-white px-4 py-2 rounded-full"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {session ? "Go to Dashboard" : "Login"}
          </Button>
        </Link>
      </header>

      {/* 🔹 Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
        <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-lg">
          Welcome to <span className="text-green-400">Bill Adjustment App</span>
        </h1>
        <p className="mt-4 text-lg md:text-2xl text-gray-200 max-w-2xl">
          Manage customers' complaints, track adjustments, and streamline your workflow with ease.
        </p>

        <div className="mt-8 flex space-x-4">
          <Link href={dashboardRoute}>
            <Button onClick={() => setLoad(true)}
              size="lg"
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full shadow-lg"
            >
              {load && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {session ? "Go to Dashboard" : "Get Started"}
            </Button>
          </Link>
          <Button
            size="lg"
            variant="outline"
            className="bg-white/20 hover:bg-white/30 text-white border-white px-6 py-3 rounded-full"
          >
            Visit Our Website
          </Button>
        </div>
      </div>
    </main>
  );
}
