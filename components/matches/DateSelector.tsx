"use client";

import { usePreferences } from "@/components/ui/AppPreferences";

type DateSelectorProps = {
  selectedDateLabel: string;
  compactSelectedDateLabel: string;
  onSelectPreviousDate: () => void;
  onSelectNextDate: () => void;
  onSelectToday: () => void;
};

export function DateSelector({
  selectedDateLabel,
  compactSelectedDateLabel,
  onSelectPreviousDate,
  onSelectNextDate,
  onSelectToday,
}: DateSelectorProps) {
  const { t } = usePreferences();

  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-2xl border border-stone-300 bg-white/85 p-2 shadow-sm shadow-stone-300/30 dark:border-zinc-800 dark:bg-zinc-900/70 dark:shadow-black/20 sm:flex sm:flex-wrap sm:gap-3 sm:p-3">
      <button
        type="button"
        onClick={onSelectPreviousDate}
        className="rounded-full border border-stone-300 px-3 py-2 text-sm font-semibold text-zinc-800 transition-colors hover:border-stone-500 hover:bg-stone-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-zinc-500 dark:hover:bg-zinc-800 sm:min-w-28"
        aria-label={t("previous")}
      >
        <span aria-hidden="true">←</span><span className="sr-only sm:not-sr-only sm:ml-1">{t("previous")}</span>
      </button>

      <p className="min-w-0 whitespace-nowrap text-center text-sm font-semibold text-zinc-900 dark:text-zinc-100 sm:flex-1 sm:text-base">
        <span className="sm:hidden">{compactSelectedDateLabel}</span>
        <span className="hidden capitalize sm:inline">{selectedDateLabel}</span>
      </p>

      <button
        type="button"
        onClick={onSelectNextDate}
        className="rounded-full border border-stone-300 px-3 py-2 text-sm font-semibold text-zinc-800 transition-colors hover:border-stone-500 hover:bg-stone-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-zinc-500 dark:hover:bg-zinc-800 sm:min-w-28"
        aria-label={t("next")}
      >
        <span className="sr-only sm:not-sr-only sm:mr-1">{t("next")}</span><span aria-hidden="true">→</span>
      </button>

      <button
        type="button"
        onClick={onSelectToday}
        className="col-span-3 rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-stone-300/30 transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:shadow-white/10 dark:hover:bg-white sm:col-span-1"
      >
        {t("today")}
      </button>
    </div>
  );
}
