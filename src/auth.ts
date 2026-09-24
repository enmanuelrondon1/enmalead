// src/auth.ts
import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getClientIp, hashKey, rateLimit } from "@/lib/rate-limit";

class RateLimitedError extends CredentialsSignin {
  code = "rate_limited";
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials, request) => {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email as string;

        const ipLimit = await rateLimit({
          key: `login:ip:${getClientIp(request)}`,
          limit: 30,
          windowSeconds: 15 * 60,
        });
        if (!ipLimit.ok) throw new RateLimitedError();

        const emailLimit = await rateLimit({
          key: `login:email:${hashKey(email.trim().toLowerCase())}`,
          limit: 8,
          windowSeconds: 15 * 60,
        });
        if (!emailLimit.ok) throw new RateLimitedError();

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          agencyId: user.agencyId,
          role: user.role,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.agencyId = user.agencyId;
        token.role = user.role;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.agencyId = token.agencyId as string;
        session.user.role = token.role as "ADMIN" | "MEMBER";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});