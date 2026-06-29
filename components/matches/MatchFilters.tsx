"use client";

import { usePreferences } from "@/components/ui/AppPreferences";
import type { MatchStatus } from "@/types/match";

export type MatchFilter = "all" | MatchStatus;

type MatchFilterOption = {
  labelKey: "all" | "live" | "upcomingFilter" | "finishedFilter";
  value: MatchFilter;
};

type MatchFiltersProps = {
  activeFilter: MatchFilter;
  onSelectFilter: (filter: MatchFilter) => void;
};

const filterOptions: MatchFilterOption[] = [
  { labelKey: "all", value: "all" },
  { labelKey: "live", value: "live" },
  { labelKey: "upcomingFilter", value: "scheduled" },
  { labelKey: "finishedFilter", value: "finished" },
];

export function MatchFilters({ activeFilter, onSelectFilter }: MatchFiltersProps) {
  const { t } = usePreferences();

  return (
    <div className="overflow-x-auto" aria-label={t("matchSections")}>
      <div className="inline-flex min-w-max gap-1 rounded-full border border-stone-200 bg-white/75 p-1 shadow-sm shadow-stone-200/40 dark:border-zinc-800 dark:bg-zinc-900/70 dark:shadow-black/20">
        {filterOptions.map(({ labelKey, value }) => {
          const isActive = activeFilter === value;

          return (
            <button
              key={value}
              type="button"
              onClick={() => onSelectFilter(value)}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-black uppercase tracking-[0.08em] transition-colors sm:px-4 ${
                isActive
                  ? "bg-zinc-950 text-white shadow-sm dark:bg-white dark:text-zinc-950"
                  : "text-stone-500 hover:bg-stone-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              }`}
            >
              {value === "live" ? <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" /> : null}
              {t(labelKey)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
