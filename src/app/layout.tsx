import "./globals.css";
import { ReactNode } from "react";
import { Inter } from "next/font/google";
import Providers from "@/components/providers"; // 👈 client wrapper

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
