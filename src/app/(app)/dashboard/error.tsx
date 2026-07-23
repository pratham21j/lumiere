"use client";

import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-[70dvh] max-w-xl items-center px-4 py-16">
      <div className="w-full rounded-3xl border border-tungsten/25 bg-tungsten/10 p-6 text-sm leading-7 text-ash">
        <div className="flex items-center gap-2 text-tungsten">
          <AlertTriangle aria-hidden className="size-4" />
          <p className="font-medium">The dashboard could not be loaded</p>
        </div>
        <p className="mt-3 text-linen">
          A temporary issue interrupted the personalization view. Please try again in a moment.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={() => reset()}>Try again</Button>
          <Button variant="outline" render={<Link href="/home" />}>
            Back to browsing
          </Button>
        </div>
      </div>
    </main>
  );
}
