import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70dvh] max-w-xl items-center px-4 py-16">
      <div className="w-full rounded-3xl border border-border/70 bg-surface p-6 text-sm leading-7 text-ash">
        <p className="text-phosphor">404</p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-linen">We couldn’t find that page</h1>
        <p className="mt-3">The route may have moved, or the content is no longer available.</p>
        <div className="mt-6">
          <Button render={<Link href="/home" />}>Return home</Button>
        </div>
      </div>
    </main>
  );
}
