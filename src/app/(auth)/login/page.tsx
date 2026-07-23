import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, authOptions } from "@/lib/auth";
import { CredentialsForm } from "@/features/auth/components/credentials-form";
import { OAuthButtons } from "@/features/auth/components/oauth-buttons";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/home");

  const anyMethod = authOptions.google || authOptions.github || authOptions.credentials;

  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <h1 className="font-display text-2xl font-bold text-linen">Welcome back</h1>
      <p className="mt-1 text-sm text-ash">
        Sign in to keep your watchlist, ratings, and taste profile.
      </p>

      <div className="mt-6">
        {anyMethod ? (
          <>
            <OAuthButtons google={authOptions.google} github={authOptions.github} />
            {authOptions.credentials ? (
              <>
                <CredentialsForm mode="login" />
                <p className="mt-4 text-center text-sm text-ash">
                  New here?{" "}
                  <Link
                    href="/register"
                    className="text-phosphor underline-offset-4 hover:underline"
                  >
                    Create an account
                  </Link>
                </p>
              </>
            ) : (
              <p className="text-sm text-ash">
                Email sign-in is disabled until a database is configured.
              </p>
            )}
          </>
        ) : (
          <div className="rounded-xl border border-tungsten/25 bg-tungsten/5 p-4 text-sm leading-relaxed text-ash">
            <p className="font-medium text-tungsten">Sign-in isn&apos;t configured yet</p>
            <p className="mt-2">
              Accounts need a database (set <code className="font-data text-linen">DATABASE_URL</code>)
              and optionally OAuth keys. The rest of the app works without signing in —
              see <span className="font-data text-linen">docs/SETUP.md</span> for the
              step-by-step guide.
            </p>
            <Link
              href="/home"
              className="mt-3 inline-block text-phosphor underline-offset-4 hover:underline"
            >
              Continue browsing without an account
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
