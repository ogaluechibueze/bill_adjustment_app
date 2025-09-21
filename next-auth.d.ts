import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface User extends DefaultUser {
    id: string; // ✅ force string to match NextAuth expectation
    username: string;
    role: string;
    region?: string;
    businessUnit?: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      username: string;
      role: string;
      region?: string;
      businessUnit?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    role: string;
    region?: string;
    businessUnit?: string;
  }
}
