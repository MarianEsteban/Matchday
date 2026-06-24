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
    <div className="flex flex-wrap gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-2 shadow-sm shadow-black/20">
      {filterOptions.map(({ labelKey, value }) => {
        const isActive = activeFilter === value;

        return (
          <button
            key={value}
            type="button"
            onClick={() => onSelectFilter(value)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              isActive
                ? "bg-zinc-100 text-zinc-950 shadow-sm shadow-white/10"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
            }`}
          >
            {t(labelKey)}
          </button>
        );
      })}
    </div>
  );
}
