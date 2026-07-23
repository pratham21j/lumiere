import Link from "next/link";
import { SITE } from "@/lib/site";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative grid min-h-dvh place-items-center px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[50dvh]"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, color-mix(in srgb, var(--tungsten) 7%, transparent), transparent 75%)",
        }}
      />
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="font-display mb-8 block text-center text-xl font-bold tracking-tight text-linen"
        >
          {SITE.name}
        </Link>
        {children}
      </div>
    </main>
  );
}
