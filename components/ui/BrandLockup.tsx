import Link from "next/link";

type BrandLockupProps = {
  href?: string;
  compact?: boolean;
};

function BrandContent({ compact = false }: { compact?: boolean }) {
  return (
    <span className="group inline-flex items-center gap-2.5 rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 shadow-sm transition-colors hover:border-emerald-500/35 dark:border-zinc-800 dark:bg-zinc-900/75 dark:shadow-black/20">
      <span className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md bg-emerald-700">
        <span className="absolute inset-1.5 rounded-md border border-white/30" />
        <span className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/35" />
        <span className="absolute inset-y-1.5 left-1/2 border-l border-white/25" />
        <span className="absolute inset-x-1.5 top-1/2 border-t border-white/25" />
        <span className="absolute bottom-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-white" />
      </span>
      <span className="min-w-0">
        <span className="block text-lg font-black leading-none tracking-tight text-zinc-950 dark:text-white sm:text-xl">
          MatchDay
        </span>
        {!compact ? (
          <span className="mt-0.5 hidden text-[0.7rem] font-semibold text-stone-500 dark:text-zinc-500 sm:block">
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
      <Link href={href} className="inline-flex rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-[#fbf7ee] dark:focus:ring-offset-zinc-950" aria-label="MatchDay home">
        <BrandContent compact={compact} />
      </Link>
    );
  }

  return <BrandContent compact={compact} />;
}
