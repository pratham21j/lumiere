import Link from "next/link";
import { Compass, FolderHeart, ListVideo, Sparkles } from "lucide-react";
import { MovieCard } from "@/components/shared/movie-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardData } from "../service";

function StatCard({ title, value, detail }: { title: string; value: string; detail: string }) {
  return (
    <Card className="border-border/70 bg-surface/70">
      <CardContent className="p-4">
        <p className="text-[11px] uppercase tracking-[0.25em] text-ash">{title}</p>
        <div className="mt-2 text-2xl font-semibold text-linen">{value}</div>
        <p className="mt-1 text-sm text-ash">{detail}</p>
      </CardContent>
    </Card>
  );
}

export function DashboardShell({ data }: { data: DashboardData }) {
  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl border border-phosphor/20 bg-linear-to-br from-phosphor/10 via-surface to-surface-raised p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow mb-2 text-phosphor/80">Personalization</p>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-linen">
              Your next best watch, tuned to your taste
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-ash">{data.profileSummary}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {data.favoriteGenres.slice(0, 4).map((genre) => (
                <Badge key={genre} variant="secondary" className="bg-surface text-linen">
                  {genre}
                </Badge>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-border/70 bg-ink/70 p-4 text-sm text-ash">
            <p className="font-medium text-linen">Favorite languages</p>
            <p className="mt-1 text-sm">
              {data.favoriteLanguages.length > 0 ? data.favoriteLanguages.join(", ") : "Still forming"}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Likes" value={String(data.stats.likes)} detail="Signal from your watch history" />
        <StatCard title="Ratings" value={String(data.stats.ratings)} detail="The patterns that matter most" />
        <StatCard title="Watchlist" value={String(data.stats.watchlistCount)} detail="Movies you want to keep close" />
        <StatCard title="Collections" value={String(data.stats.collectionCount)} detail="Curated pockets of taste" />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-border/70 bg-surface/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles aria-hidden className="size-4 text-phosphor" />
              Recommended for you
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.recommendations.length === 0 ? (
              <p className="text-sm text-ash">
                We need a little more signal before we can suggest your next favorite film.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {data.recommendations.map((item) => (
                  <div key={item.movie.id} className="space-y-2">
                    <MovieCard movie={item.movie} />
                    <p className="text-sm text-ash">{item.reason}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/70 bg-surface/70">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Compass aria-hidden className="size-4 text-phosphor" />
                Recent activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.recentActivity.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-3 rounded-xl border border-border/60 bg-ink/40 p-3">
                  <div>
                    <p className="text-sm font-medium text-linen">{item.title}</p>
                    <p className="mt-0.5 text-sm text-ash">{item.movieTitle}</p>
                  </div>
                  <span className="font-data text-[11px] text-ash/70">
                    {new Date(item.createdAt).toLocaleDateString("en", { month: "short", day: "numeric" })}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-surface/70">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListVideo aria-hidden className="size-4 text-phosphor" />
                Keep watching
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.watchlist.length === 0 ? (
                <p className="text-sm text-ash">Your watchlist is empty. Start saving films to build your queue.</p>
              ) : (
                data.watchlist.slice(0, 4).map((entry) => (
                  <Link
                    key={entry.movie.id}
                    href={`/movies/${entry.movie.id}`}
                    className="flex items-center justify-between rounded-xl border border-border/60 bg-ink/40 px-3 py-2 text-sm text-linen transition-colors hover:border-phosphor/30"
                  >
                    <span>{entry.movie.title}</span>
                    <span className="font-data text-[11px] uppercase text-ash">{entry.status}</span>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-surface/70">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderHeart aria-hidden className="size-4 text-phosphor" />
                Smart collections
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.collections.length === 0 ? (
                <p className="text-sm text-ash">Collections will appear here once you start curating your library.</p>
              ) : (
                data.collections.slice(0, 4).map((collection) => (
                  <Link
                    key={collection.id}
                    href={`/collections/${collection.slug}`}
                    className="flex items-center justify-between rounded-xl border border-border/60 bg-ink/40 px-3 py-2 text-sm text-linen transition-colors hover:border-phosphor/30"
                  >
                    <span>{collection.name}</span>
                    <span className="font-data text-[11px] text-ash">{collection.count} films</span>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
