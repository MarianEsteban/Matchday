type EmptyMatchStateProps = {
  icon: string;
  title: string;
  description: string;
};

export function EmptyMatchState({ icon, title, description }: EmptyMatchStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-700/80 bg-zinc-900/70 p-8 text-center shadow-sm shadow-black/20">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-zinc-700 bg-zinc-950 text-2xl shadow-inner shadow-black/30">
        <span aria-hidden="true">{icon}</span>
      </div>
      <p className="text-base font-semibold text-zinc-100">{title}</p>
      <p className="mt-2 text-sm text-zinc-400">{description}</p>
    </div>
  );
}
