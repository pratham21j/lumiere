"use client";

import { useState } from "react";
import type { WatchStatus } from "@prisma/client";
import { MovieCard } from "@/components/shared/movie-card";
import type { WatchlistEntry } from "../queries";

const TABS: { key: WatchStatus | "ALL"; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "PLANNED", label: "Plan to watch" },
  { key: "WATCHING", label: "Watching" },
  { key: "WATCHED", label: "Watched" },
];

export function WatchlistTabs({ entries }: { entries: WatchlistEntry[] }) {
  const [tab, setTab] = useState<WatchStatus | "ALL">("ALL");
  const visible = tab === "ALL" ? entries : entries.filter((e) => e.status === tab);

  return (
    <>
      <div role="tablist" aria-label="Filter by status" className="flex flex-wrap gap-2">
        {TABS.map((t) => {
          const count =
            t.key === "ALL"
              ? entries.length
              : entries.filter((e) => e.status === t.key).length;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.key)}
              className={`rounded-lg px-3 py-1.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-phosphor ${
                active
                  ? "bg-surface-raised text-linen"
                  : "text-ash hover:text-linen"
              }`}
            >
              {t.label}
              <span className="font-data ml-1.5 text-xs text-ash">{count}</span>
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <p className="mt-16 text-center text-sm text-ash">
          Nothing here yet. Films you save land in this tab.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {visible.map((e) => (
            <MovieCard key={e.movie.id} movie={e.movie} />
          ))}
        </div>
      )}
    </>
  );
}
