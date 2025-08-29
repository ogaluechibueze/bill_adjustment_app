import Navbar from "@/components/Navbar";
import { ReactNode } from "react";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body >
        {/* Navbar fixed at top */}
        <Navbar />

        {/* Page content with spacing below navbar */}
        <main className="container mx-auto px-4 pt-20 pb-10">
          {children}
        </main>
      </body>
    </html>
  );
}
