import { Skeleton } from "@/components/ui/Skeleton";

export function MatchListSkeleton() {
  return (
    <div className="space-y-3" aria-hidden="true">
      {[0, 1].map((section) => (
        <section key={section} className="overflow-hidden rounded-2xl border border-stone-200 bg-white/72 shadow-sm shadow-stone-200/40 dark:border-zinc-800 dark:bg-zinc-950/70 dark:shadow-black/20">
          <div className="flex items-center gap-3 border-b border-stone-200 bg-stone-50/80 px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-900/80">
            <Skeleton className="h-7 w-7 rounded-lg" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-36" />
              <Skeleton className="h-2.5 w-20" />
            </div>
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
          <div className="divide-y divide-stone-100 dark:divide-zinc-900">
            {[0, 1, 2].map((row) => (
              <div key={row} className="grid grid-cols-[3.1rem_minmax(0,1fr)_3.3rem] items-center gap-2 px-3 py-3 sm:grid-cols-[4.4rem_minmax(0,1fr)_3.8rem] sm:px-4">
                <Skeleton className="h-6 w-12 rounded-full" />
                <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_3.4rem_minmax(0,1fr)] items-center gap-2 sm:grid-cols-[minmax(0,1fr)_4rem_minmax(0,1fr)]">
                  <div className="flex min-w-0 items-center gap-2"><Skeleton className="h-7 w-7 rounded-full" /><Skeleton className="h-3.5 w-full max-w-28" /></div>
                  <Skeleton className="h-7 w-12 rounded-lg" />
                  <div className="flex min-w-0 flex-row-reverse items-center gap-2"><Skeleton className="h-7 w-7 rounded-full" /><Skeleton className="h-3.5 w-full max-w-28" /></div>
                </div>
                <Skeleton className="h-6 w-12 rounded-full" />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
