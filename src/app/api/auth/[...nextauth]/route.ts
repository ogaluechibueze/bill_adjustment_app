// ✅ src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth"; // <-- import your shared NextAuth options

// Create a NextAuth handler with your config
const handler = NextAuth(authOptions);

// ✅ Only export the HTTP methods
export { handler as GET, handler as POST };
