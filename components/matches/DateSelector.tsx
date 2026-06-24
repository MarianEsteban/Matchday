"use client";

import { usePreferences } from "@/components/ui/AppPreferences";

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
  const { t } = usePreferences();

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-stone-300 bg-white/80 p-3 shadow-sm shadow-stone-300/30 dark:border-zinc-800 dark:bg-zinc-900/70 dark:shadow-black/20">
      <button
        type="button"
        onClick={onSelectPreviousDate}
        className="rounded-full border border-stone-300 px-3 py-2 text-sm font-semibold text-zinc-800 transition-colors hover:border-stone-500 hover:bg-stone-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-zinc-500 dark:hover:bg-zinc-800"
        aria-label={t("previous")}
      >
        ← {t("previous")}
      </button>

      <p className="min-w-0 flex-1 text-center text-sm font-semibold capitalize text-zinc-900 dark:text-zinc-100 sm:text-base">
        {selectedDateLabel}
      </p>

      <button
        type="button"
        onClick={onSelectNextDate}
        className="rounded-full border border-stone-300 px-3 py-2 text-sm font-semibold text-zinc-800 transition-colors hover:border-stone-500 hover:bg-stone-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-zinc-500 dark:hover:bg-zinc-800"
        aria-label={t("next")}
      >
        {t("next")} →
      </button>

      <button
        type="button"
        onClick={onSelectToday}
        className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-stone-300/30 transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:shadow-white/10 dark:hover:bg-white"
      >
        {t("today")}
      </button>
    </div>
  );
}
