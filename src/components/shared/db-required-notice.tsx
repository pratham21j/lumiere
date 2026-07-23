import Link from "next/link";

/** Rendered by persistence-backed pages when DATABASE_URL isn't set. */
export function DbRequiredNotice({ feature }: { feature: string }) {
  return (
    <main className="grid min-h-[70dvh] place-items-center px-4">
      <div className="max-w-md rounded-2xl border border-tungsten/25 bg-tungsten/5 p-6 text-sm leading-relaxed text-ash">
        <p className="font-medium text-tungsten">{feature} needs a database</p>
        <p className="mt-2">
          This feature stores data, which requires Postgres. Create a free
          database at neon.tech, set{" "}
          <code className="font-data text-linen">DATABASE_URL</code> in{" "}
          <code className="font-data text-linen">.env</code>, then run{" "}
          <code className="font-data text-linen">npm run db:migrate && npm run db:seed</code>.
          Full walkthrough in <span className="font-data text-linen">docs/SETUP.md</span>.
        </p>
        <Link
          href="/home"
          className="mt-4 inline-block text-phosphor underline-offset-4 hover:underline"
        >
          Back to browsing
        </Link>
      </div>
    </main>
  );
}
