"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-dvh bg-ink text-linen">
        <main className="mx-auto flex min-h-dvh max-w-xl items-center px-4 py-16">
          <div className="w-full rounded-3xl border border-tungsten/25 bg-tungsten/10 p-6 text-sm leading-7 text-ash">
            <div className="flex items-center gap-2 text-tungsten">
              <AlertTriangle aria-hidden className="size-4" />
              <p className="font-medium">Something went wrong</p>
            </div>
            <p className="mt-3 text-linen">
              Lumière hit an unexpected error. The app is still usable; you can recover by refreshing or heading back home.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={() => reset()}>Try again</Button>
              <Button variant="outline" render={<Link href="/home" />}>
                Back home
              </Button>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
