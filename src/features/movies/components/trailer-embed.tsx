"use client";

import { useState } from "react";
import { Play, X } from "lucide-react";

/**
 * Trailer button + lazy YouTube embed. The iframe loads only on demand —
 * no third-party requests until the user asks for the trailer.
 */
export function TrailerEmbed({ trailerKey, title }: { trailerKey: string; title: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="glow-tungsten flex items-center gap-2 rounded-xl bg-tungsten px-4 py-2 text-sm font-medium text-[#171203] transition-transform hover:scale-[1.02] active:scale-95"
      >
        <Play aria-hidden className="size-4 fill-current" />
        Watch trailer
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title} trailer`}
          className="fixed inset-0 z-[60] grid place-items-center bg-ink/90 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close trailer"
              className="absolute -top-10 right-0 rounded-lg p-2 text-ash hover:text-linen focus-visible:outline-2 focus-visible:outline-phosphor"
            >
              <X className="size-5" />
            </button>
            <div className="aspect-video overflow-hidden rounded-xl border border-border">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1`}
                title={`${title} trailer`}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
