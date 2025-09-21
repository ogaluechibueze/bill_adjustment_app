import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {

  
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        
      },
      async authorize(creds) {
        if (!creds?.email || !creds?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: creds.email },
        });

        if (!user || !user.active) return null;

        const ok = await bcrypt.compare(creds.password, user.password);
        if (!ok) return null;

        console.log("Authorize → DB user:", user);
                return {
          id: String(user.id),
          email: user.email,
          username: user.username,
          role: user.role,
          region: user.region ?? null,
          businessUnit: user.bussinessUnit ?? null, // ✅ map correctly
         };
      },
      
    }),
  ],
  callbacks: {
   async jwt({ token, user }) {
  if (user) {
    token.id = user.id;
    token.role = user.role;
    token.username = user.username;
    token.region = user.region;
    token.businessUnit = user.businessUnit; // 👈 match schema spelling
  } else {
    // 🔑 Refresh user from DB if missing
    const dbUser = await prisma.user.findUnique({
      where: { id: parseInt(token.id as string) },
      select: { region: true, bussinessUnit: true },
    });
    if (dbUser) {
      token.region = dbUser.region;
      token.businessUnit = dbUser.bussinessUnit;
    }
  }
  return token;
}
,
    async session({ session, token }) {
  if (token) {
    (session.user as any).id = token.id;
    (session.user as any).role = token.role;
    (session.user as any).username = token.username;
    (session.user as any).region = token.region ?? null;
    (session.user as any).businessUnit = token.businessUnit ?? null;
  }
  console.log("Session callback → session.user:", session.user);
  return session;
}   
  },
  
};
