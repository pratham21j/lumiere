import type { Metadata } from "next";
import { resolved } from "@/lib/env";
import { requireUser } from "@/features/auth/session";
import { DbRequiredNotice } from "@/components/shared/db-required-notice";
import { getDashboardData } from "@/features/personalization/service";
import { DashboardShell } from "@/features/personalization/components/dashboard-shell";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  if (!resolved.hasDatabase) {
    return <DbRequiredNotice feature="Your dashboard" />;
  }

  const user = await requireUser();
  const data = await getDashboardData(user.id);

  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
      <div className="pb-8 pt-10">
        <p className="eyebrow mb-1">Personalized view</p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-linen">Your dashboard</h1>
        <p className="mt-1 text-sm text-ash">
          A calm readout of what you enjoy, what you saved, and what to watch next.
        </p>
      </div>

      <DashboardShell data={data} />
    </main>
  );
}
