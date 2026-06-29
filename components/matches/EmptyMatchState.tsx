type EmptyMatchStateProps = {
  icon: string;
  title: string;
  description: string;
};

export function EmptyMatchState({ icon, title, description }: EmptyMatchStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-stone-300 bg-white/78 p-6 text-center shadow-sm shadow-stone-200/45 dark:border-zinc-700/80 dark:bg-zinc-900/70 dark:shadow-black/20 sm:p-8">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-stone-200 bg-stone-50 text-2xl shadow-inner shadow-stone-200/60 dark:border-zinc-700 dark:bg-zinc-950 dark:shadow-black/30">
        <span aria-hidden="true">{icon}</span>
      </div>
      <p className="text-base font-black text-zinc-950 dark:text-zinc-100">{title}</p>
      <p className="mt-2 text-sm text-stone-600 dark:text-zinc-400">{description}</p>
    </div>
  );
}
