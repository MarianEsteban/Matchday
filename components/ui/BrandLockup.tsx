import Link from "next/link";

type BrandLockupProps = {
  href?: string;
  compact?: boolean;
};

function BrandContent({ compact = false }: { compact?: boolean }) {
  return (
    <span className="group inline-flex items-center gap-3 rounded-[1.35rem] border border-amber-500/20 bg-white/75 px-3 py-2 shadow-lg shadow-stone-300/30 backdrop-blur transition-colors hover:border-amber-500/40 dark:border-amber-300/15 dark:bg-zinc-900/70 dark:shadow-black/30">
      <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-950 via-zinc-800 to-amber-500 shadow-inner shadow-white/10 dark:from-amber-300 dark:via-amber-500 dark:to-zinc-950">
        <span className="absolute inset-1 rounded-[0.85rem] border border-white/25" />
        <span className="absolute h-8 w-8 rounded-full border border-white/35" />
        <span className="absolute h-0.5 w-9 rotate-45 rounded-full bg-white/30" />
        <span className="absolute h-0.5 w-9 -rotate-45 rounded-full bg-white/30" />
        <span className="relative h-2.5 w-2.5 rounded-full bg-white shadow-sm shadow-black/30" />
      </span>
      <span className="min-w-0">
        <span className="block text-xl font-black leading-none tracking-tight text-zinc-950 dark:text-white sm:text-2xl">
          Match<span className="text-amber-600 dark:text-amber-300">Day</span>
        </span>
        {!compact ? (
          <span className="mt-1 hidden text-[0.65rem] font-bold uppercase tracking-[0.28em] text-stone-500 dark:text-zinc-500 sm:block">
            Football Match Center
          </span>
        ) : null}
      </span>
    </span>
  );
}

export function BrandLockup({ href, compact = false }: BrandLockupProps) {
  if (href) {
    return (
      <Link href={href} className="inline-flex rounded-[1.35rem] focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-[#fbf7ee] dark:focus:ring-offset-zinc-950" aria-label="MatchDay home">
        <BrandContent compact={compact} />
      </Link>
    );
  }

  return <BrandContent compact={compact} />;
}
