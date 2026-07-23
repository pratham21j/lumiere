import Link from "next/link";
import { SITE } from "@/lib/site";

/**
 * Temporary placeholder for routes built in later phases.
 * Each stub page renders this until its real feature lands.
 */
export function ComingSoon({ title, phase }: { title: string; phase: string }) {
  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="text-center">
        <p className="eyebrow mb-4">{SITE.name} — under construction</p>
        <h1 className="font-display text-3xl font-bold text-linen sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-sm text-ash">
          This area arrives in {phase} of the build.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block text-sm text-phosphor underline-offset-4 hover:underline"
        >
          Back to the landing page
        </Link>
      </div>
    </main>
  );
}
