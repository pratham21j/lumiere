"use server";

import { hash } from "bcryptjs";
import { z } from "zod";
import { AuthError } from "next-auth";
import { requireDb } from "@/lib/db";
import { resolved } from "@/lib/env";
import { signIn, signOut } from "@/lib/auth";
import { logger } from "@/lib/logger";

export interface AuthFormState {
  error?: string;
  ok?: boolean;
}

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name needs at least 2 characters").max(60),
  email: z.string().email("Enter a valid email address").toLowerCase(),
  password: z.string().min(8, "Password needs at least 8 characters").max(100),
});

export async function registerUser(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  if (!resolved.hasDatabase) {
    return { error: "Email sign-up needs a database. Set DATABASE_URL — see docs/SETUP.md." };
  }
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const { name, email, password } = parsed.data;
  const db = requireDb();

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists. Sign in instead." };
  }

  await db.user.create({
    data: { name, email, passwordHash: await hash(password, 12) },
  });
  logger.info("user registered", { email });

  await signIn("credentials", { email, password, redirectTo: "/home" });
  return { ok: true };
}

export async function loginWithCredentials(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  if (!resolved.hasDatabase) {
    return { error: "Email sign-in needs a database. Set DATABASE_URL — see docs/SETUP.md." };
  }
  try {
    await signIn("credentials", {
      email: String(formData.get("email") ?? "").toLowerCase(),
      password: String(formData.get("password") ?? ""),
      redirectTo: "/home",
    });
    return { ok: true };
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Email or password didn't match. Try again." };
    }
    throw err; // NEXT_REDIRECT on success must propagate
  }
}

export async function loginWithProvider(provider: "google" | "github") {
  await signIn(provider, { redirectTo: "/home" });
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}
