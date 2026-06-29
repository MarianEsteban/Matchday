import { BrandLockup } from "@/components/ui/BrandLockup";
import { Skeleton } from "@/components/ui/Skeleton";
import { MatchListSkeleton } from "@/components/matches/MatchListSkeleton";

export default function Loading() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_28rem),linear-gradient(180deg,#fbfaf5,#f0eee7)] pb-6 text-zinc-950 dark:bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_26rem),linear-gradient(180deg,#09090b,#0a0a0a)] dark:text-white">
      <div className="border-b border-zinc-800 bg-zinc-950/96 py-2">
        <div className="mx-auto flex max-w-7xl gap-3 px-4" aria-hidden="true">
          {[0, 1, 2, 3].map((item) => <Skeleton key={item} className="h-7 w-44 rounded-full bg-white/10" />)}
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-5 sm:py-5">
        <header className="mb-5 flex items-center justify-between gap-3">
          <BrandLockup />
          <Skeleton className="h-10 w-40 rounded-2xl" />
        </header>
        <Skeleton className="mb-3 h-7 w-48" />
        <Skeleton className="mb-4 h-20 w-full rounded-2xl" />
        <div className="grid gap-4 lg:grid-cols-[17rem_1fr] lg:gap-5">
          <Skeleton className="hidden h-96 rounded-2xl lg:block" />
          <MatchListSkeleton />
        </div>
      </div>
    </main>
  );
}
