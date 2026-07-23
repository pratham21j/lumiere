import NextAuth, { type DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { env, resolved } from "@/lib/env";

/**
 * Auth.js v5 — JWT sessions (no DB round-trip per render), Prisma adapter
 * for account/user persistence. OAuth providers register only when their
 * keys exist; credentials login needs the database. With neither, the
 * login page explains what to configure instead of erroring.
 */

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "USER" | "ADMIN";
    } & DefaultSession["user"];
  }
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const providers = [
  ...(resolved.hasGoogleAuth
    ? [Google({ clientId: env.AUTH_GOOGLE_ID, clientSecret: env.AUTH_GOOGLE_SECRET })]
    : []),
  ...(resolved.hasGithubAuth
    ? [GitHub({ clientId: env.AUTH_GITHUB_ID, clientSecret: env.AUTH_GITHUB_SECRET })]
    : []),
  Credentials({
    name: "Email & password",
    credentials: { email: { type: "email" }, password: { type: "password" } },
    async authorize(raw) {
      if (!prisma) return null;
      const parsed = credentialsSchema.safeParse(raw);
      if (!parsed.success) return null;
      const user = await prisma.user.findUnique({
        where: { email: parsed.data.email.toLowerCase() },
      });
      if (!user?.passwordHash) return null;
      const valid = await compare(parsed.data.password, user.passwordHash);
      if (!valid) return null;
      return { id: user.id, email: user.email, name: user.name, image: user.image };
    },
  }),
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...(prisma ? { adapter: PrismaAdapter(prisma) } : {}),
  providers,
  session: { strategy: "jwt" },
  secret: env.AUTH_SECRET ?? "lumiere-insecure-dev-secret-set-AUTH_SECRET",
  trustHost: true,
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user }) {
      // On sign-in, stamp id + role into the token once.
      if (user?.id) {
        token.id = user.id;
        if (prisma) {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { role: true },
          });
          token.role = dbUser?.role ?? "USER";
        }
      }
      return token;
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      session.user.role = (token.role as "USER" | "ADMIN") ?? "USER";
      return session;
    },
  },
});

/** OAuth availability, for rendering the right login buttons. */
export const authOptions = {
  google: resolved.hasGoogleAuth,
  github: resolved.hasGithubAuth,
  credentials: resolved.hasDatabase,
} as const;
