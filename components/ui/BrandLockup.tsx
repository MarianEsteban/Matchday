import Link from "next/link";

type BrandLockupProps = {
  href?: string;
  compact?: boolean;
};

function BrandContent({ compact = false }: { compact?: boolean }) {
  return (
    <span className="group inline-flex items-center gap-2.5 rounded-2xl border border-stone-200 bg-white/82 px-2.5 py-1.5 shadow-sm shadow-stone-200/50 backdrop-blur transition-colors hover:border-emerald-500/35 dark:border-zinc-800 dark:bg-zinc-900/75 dark:shadow-black/20">
      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[radial-gradient(circle_at_35%_30%,#d1fae5_0_13%,transparent_14%),linear-gradient(135deg,#052e2b,#0f172a_52%,#10b981)] shadow-inner shadow-white/10 ring-1 ring-white/25">
        <span className="absolute inset-1.5 rounded-xl border border-white/25" />
        <span className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/35" />
        <span className="absolute inset-y-1.5 left-1/2 border-l border-white/25" />
        <span className="absolute inset-x-1.5 top-1/2 border-t border-white/25" />
        <span className="absolute bottom-1.5 right-1.5 h-2 w-2 rounded-full bg-white shadow-sm shadow-black/30" />
      </span>
      <span className="min-w-0">
        <span className="block bg-gradient-to-r from-zinc-950 via-zinc-800 to-emerald-700 bg-clip-text text-lg font-black leading-none tracking-tight text-transparent dark:from-white dark:via-zinc-200 dark:to-emerald-300 sm:text-xl">
          MatchDay
        </span>
        {!compact ? (
          <span className="mt-1 hidden text-[0.65rem] font-black uppercase tracking-[0.28em] text-stone-500 dark:text-zinc-500 sm:block">
            Football scores
          </span>
        ) : null}
      </span>
    </span>
  );
}

export function BrandLockup({ href, compact = false }: BrandLockupProps) {
  if (href) {
    return (
      <Link href={href} className="inline-flex rounded-[1.45rem] focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-[#fbf7ee] dark:focus:ring-offset-zinc-950" aria-label="MatchDay home">
        <BrandContent compact={compact} />
      </Link>
    );
  }

  return <BrandContent compact={compact} />;
}
