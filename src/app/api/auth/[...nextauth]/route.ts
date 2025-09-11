import { prisma } from "@/lib/prisma";
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username?: string;
      role?: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    username?: string;
    role?: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    username?: string;
    role?: string;
  }
}

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
     async authorize(credentials) {
  // ✅ Runtime check
  if (!credentials?.email || !credentials?.password) {
    throw new Error("Missing email or password");
  }

  const user = await prisma.user.findUnique({
    where: { email: credentials.email },
  });

  if (user && user.password === credentials.password) {
    return {
      id: String(user.id),        // 👈 force to string
      email: user.email,
      username: user.username ?? undefined,
      role: user.role ?? undefined,
    };
  }

  return null;
},
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.username = token.username;
        session.user.role = token.role;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt", // ✅ recommended with credentials provider
  },
  pages: {
    signIn: "/login", // redirect users to your login page
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
