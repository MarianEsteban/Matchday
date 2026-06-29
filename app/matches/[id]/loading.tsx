import { BrandLockup } from "@/components/ui/BrandLockup";
import { Skeleton } from "@/components/ui/Skeleton";

export default function MatchDetailLoading() {
  return (
    <main className="min-h-screen bg-[#fbf7ee] pb-6 text-zinc-950 dark:bg-zinc-950 dark:text-white">
      <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 lg:py-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <BrandLockup href="/" compact />
          <Skeleton className="h-10 w-40 rounded-2xl" />
        </div>
        <section className="overflow-hidden rounded-[1.75rem] border border-stone-300 bg-white/95 shadow-xl shadow-stone-300/25 dark:border-zinc-800 dark:bg-zinc-900/90 dark:shadow-black/35">
          <div className="border-b border-stone-200 bg-stone-50/80 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/45 sm:px-5">
            <Skeleton className="h-4 w-72 max-w-full" />
            <Skeleton className="mt-2 h-3 w-56 max-w-full" />
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 px-3 py-5 sm:gap-5 sm:px-6 sm:py-6">
            <div className="flex min-w-0 flex-col items-center gap-2 sm:flex-row"><Skeleton className="h-12 w-12 rounded-full" /><Skeleton className="h-5 w-32" /></div>
            <Skeleton className="h-16 w-24 rounded-2xl sm:w-28" />
            <div className="flex min-w-0 flex-col-reverse items-center gap-2 sm:flex-row sm:justify-end"><Skeleton className="h-5 w-32" /><Skeleton className="h-12 w-12 rounded-full" /></div>
          </div>
        </section>
        <div className="mt-4"><Skeleton className="h-14 w-full rounded-2xl" /><Skeleton className="mt-4 h-72 w-full rounded-3xl" /></div>
      </div>
    </main>
  );
}
