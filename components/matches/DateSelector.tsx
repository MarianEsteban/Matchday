"use client";

import { usePreferences } from "@/components/ui/AppPreferences";
import { createLocalDateFromKey, formatDateKey, shiftLocalDateKey } from "@/lib/match-date";
import { languageLocales } from "@/lib/i18n";

type DateSelectorProps = {
  selectedDate: string;
  onSelectDate: (selectedDate: string) => void;
};

export function DateSelector({ selectedDate, onSelectDate }: DateSelectorProps) {
  const { language, t } = usePreferences();
  const todayKey = formatDateKey(new Date());
  const dates = [-3, -2, -1, 0, 1, 2, 3].map((offset) => shiftLocalDateKey(selectedDate, offset));

  return (
    <div className="rounded-2xl border border-stone-200 bg-white/80 p-2 shadow-sm shadow-stone-200/50 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70 dark:shadow-black/20">
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
        <button
          type="button"
          onClick={() => onSelectDate(shiftLocalDateKey(selectedDate, -1))}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 bg-stone-50 text-sm font-bold text-zinc-800 transition hover:border-stone-400 hover:bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:border-zinc-600"
          aria-label={t("previous")}
        >
          ←
        </button>

        <div className="ticker-mask overflow-x-auto" aria-label={t("dateTime")}>
          <div className="mx-auto flex min-w-max justify-center gap-1.5 px-1">
            {dates.map((dateKey) => {
              const date = createLocalDateFromKey(dateKey);
              const isSelected = dateKey === selectedDate;
              const isToday = dateKey === todayKey;
              const weekday = new Intl.DateTimeFormat(languageLocales[language], { weekday: "short" }).format(date).replace(".", "");
              const month = new Intl.DateTimeFormat(languageLocales[language], { month: "short" }).format(date).replace(".", "");
              const day = new Intl.DateTimeFormat(languageLocales[language], { day: "numeric" }).format(date);

              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() => onSelectDate(dateKey)}
                  className={`relative min-w-[4.35rem] rounded-xl border px-2.5 py-2 text-center transition ${
                    isSelected
                      ? "border-emerald-500 bg-zinc-950 text-white shadow-sm shadow-emerald-500/20 dark:bg-white dark:text-zinc-950"
                      : "border-transparent text-stone-600 hover:border-stone-200 hover:bg-stone-50 hover:text-zinc-950 dark:text-zinc-400 dark:hover:border-zinc-800 dark:hover:bg-zinc-950 dark:hover:text-white"
                  }`}
                  aria-current={isSelected ? "date" : undefined}
                >
                  <span className="block text-[0.62rem] font-black uppercase tracking-[0.16em]">{weekday}</span>
                  <span className="mt-0.5 block text-base font-black leading-none">{day}</span>
                  <span className="mt-0.5 block text-[0.62rem] font-bold uppercase tracking-wide opacity-70">{month}</span>
                  {isToday ? <span className={`mt-1 inline-block rounded-full px-1.5 py-0.5 text-[0.55rem] font-black uppercase ${isSelected ? "bg-emerald-400 text-zinc-950" : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"}`}>{t("today")}</span> : null}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onSelectDate(shiftLocalDateKey(selectedDate, 1))}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 bg-stone-50 text-sm font-bold text-zinc-800 transition hover:border-stone-400 hover:bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:border-zinc-600"
          aria-label={t("next")}
        >
          →
        </button>
      </div>
    </div>
  );
}
