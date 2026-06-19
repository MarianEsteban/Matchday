type DateSelectorProps = {
  selectedDateLabel: string;
  onSelectPreviousDate: () => void;
  onSelectNextDate: () => void;
  onSelectToday: () => void;
};

export function DateSelector({
  selectedDateLabel,
  onSelectPreviousDate,
  onSelectNextDate,
  onSelectToday,
}: DateSelectorProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-3 shadow-sm shadow-black/20">
      <button
        type="button"
        onClick={onSelectPreviousDate}
        className="rounded-full border border-zinc-700 px-3 py-2 text-sm font-semibold text-zinc-200 transition-colors hover:border-zinc-500 hover:bg-zinc-800"
        aria-label="Ver partidos del día anterior"
      >
        ← Anterior
      </button>

      <p className="min-w-0 flex-1 text-center text-sm font-semibold capitalize text-zinc-100 sm:text-base">
        {selectedDateLabel}
      </p>

      <button
        type="button"
        onClick={onSelectNextDate}
        className="rounded-full border border-zinc-700 px-3 py-2 text-sm font-semibold text-zinc-200 transition-colors hover:border-zinc-500 hover:bg-zinc-800"
        aria-label="Ver partidos del día siguiente"
      >
        Siguiente →
      </button>

      <button
        type="button"
        onClick={onSelectToday}
        className="rounded-full bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-950 shadow-sm shadow-white/10 transition-colors hover:bg-white"
      >
        Hoy
      </button>
    </div>
  );
}
