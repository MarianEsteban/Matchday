type EmptyMatchStateProps = {
  title: string;
  description: string;
  helper?: string;
};

export function EmptyMatchState({ title, description, helper }: EmptyMatchStateProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-emerald-500/15 bg-white/82 px-5 py-5 shadow-sm shadow-emerald-950/5 dark:border-emerald-400/15 dark:bg-zinc-900/72 dark:shadow-black/20 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative h-16 w-full max-w-[11rem] shrink-0 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-50 to-stone-50 shadow-inner shadow-emerald-900/5 dark:border-emerald-300/15 dark:from-emerald-950/40 dark:to-zinc-950 dark:shadow-black/25" aria-hidden="true">
          <div className="absolute inset-2 rounded-xl border border-emerald-500/25 dark:border-emerald-300/20" />
          <div className="absolute left-1/2 top-2 h-10 w-px -translate-x-1/2 bg-emerald-500/18 dark:bg-emerald-300/15" />
          <div className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-500/25 dark:border-emerald-300/20" />
          <div className="empty-state-glow absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border border-emerald-600/45 bg-white shadow-[0_0_18px_rgba(16,185,129,0.24)] dark:border-emerald-200/50 dark:bg-emerald-100/90" />
        </div>

        <div className="empty-state-copy min-w-0 text-center sm:text-left">
          <p className="text-base font-black text-zinc-950 dark:text-zinc-100">{title}</p>
          <p className="mt-1.5 text-sm leading-6 text-stone-600 dark:text-zinc-400">{description}</p>
          {helper ? <p className="mt-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">{helper}</p> : null}
        </div>
      </div>
    </div>
  );
}
