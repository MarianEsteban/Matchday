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
    <div className="overflow-x-auto rounded-2xl border border-stone-300 bg-white/85 p-2 shadow-sm shadow-stone-300/30 dark:border-zinc-800 dark:bg-zinc-900/70 dark:shadow-black/20" aria-label={t("matchSections")}>
      <div className="flex min-w-max gap-2">
      {filterOptions.map(({ labelKey, value }) => {
        const isActive = activeFilter === value;

        return (
          <button
            key={value}
            type="button"
            onClick={() => onSelectFilter(value)}
            className={`whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold transition-colors sm:px-4 ${
              isActive
                ? "bg-zinc-900 text-white shadow-sm shadow-stone-300/30 dark:bg-zinc-100 dark:text-zinc-950 dark:shadow-white/10"
                : "text-stone-600 hover:bg-stone-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            }`}
          >
            {t(labelKey)}
          </button>
        );
      })}
      </div>
    </div>
  );
}
