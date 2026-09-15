// src/types/next-auth.d.ts
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      agencyId: string;
      role: "ADMIN" | "MEMBER";
    } & DefaultSession["user"];
  }

  interface User {
    agencyId: string;
    role: "ADMIN" | "MEMBER";
  }
}