import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/** Page guard: returns the signed-in user or redirects to /login. */
export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user;
}

/** Page guard for admin-only areas. */
export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/home");
  return user;
}

/** Action guard: throws instead of redirecting (for server actions). */
export async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("You need to sign in to do that.");
  return session.user.id;
}
