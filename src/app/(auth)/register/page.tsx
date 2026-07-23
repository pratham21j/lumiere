import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, authOptions } from "@/lib/auth";
import { CredentialsForm } from "@/features/auth/components/credentials-form";
import { OAuthButtons } from "@/features/auth/components/oauth-buttons";

export const metadata: Metadata = { title: "Create account" };

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) redirect("/home");

  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <h1 className="font-display text-2xl font-bold text-linen">Create your account</h1>
      <p className="mt-1 text-sm text-ash">
        Your likes and ratings become a taste profile the concierge learns from.
      </p>

      <div className="mt-6">
        <OAuthButtons google={authOptions.google} github={authOptions.github} />
        {authOptions.credentials ? (
          <>
            <CredentialsForm mode="register" />
            <p className="mt-4 text-center text-sm text-ash">
              Already have an account?{" "}
              <Link href="/login" className="text-phosphor underline-offset-4 hover:underline">
                Sign in
              </Link>
            </p>
          </>
        ) : (
          <p className="text-sm leading-relaxed text-ash">
            Sign-up needs a database. Set{" "}
            <code className="font-data text-linen">DATABASE_URL</code> (free at neon.tech),
            run the migrations, and this form activates — see{" "}
            <span className="font-data text-linen">docs/SETUP.md</span>.
          </p>
        )}
      </div>
    </div>
  );
}
