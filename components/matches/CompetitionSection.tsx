"use client";

import { usePreferences } from "@/components/ui/AppPreferences";
import { translateCompetitionName } from "@/lib/i18n";
import type { Match } from "@/types/match";
import { MatchCard } from "@/components/matches/MatchCard";

type CompetitionSectionProps = {
  competition: string;
  matches: Match[];
  isCollapsed: boolean;
  onToggle: (competition: string) => void;
};

export function createCompetitionSectionId(competition: string) {
  return `competition-${competition.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

export function CompetitionSection({ competition, matches, isCollapsed, onToggle }: CompetitionSectionProps) {
  const { language, t } = usePreferences();
  const sectionId = createCompetitionSectionId(competition);
  const country = matches.find((match) => match.apiFootball?.leagueCountry)?.apiFootball?.leagueCountry;

  return (
    <section id={sectionId} className="scroll-mt-4 overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950/74 dark:shadow-black/20">
      <button
        type="button"
        onClick={() => onToggle(competition)}
        aria-expanded={!isCollapsed}
        aria-controls={sectionId}
        className="group sticky top-0 z-10 flex w-full items-center gap-3 border-b border-stone-200 bg-stone-50 px-3 py-2 text-left backdrop-blur transition hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/92 dark:hover:bg-zinc-900"
      >
        <span aria-hidden="true" className={`text-xs text-stone-500 transition-transform dark:text-zinc-400 ${isCollapsed ? "-rotate-90" : "rotate-0"}`}>▾</span>
        <span className="hidden">{translateCompetitionName(competition, language).slice(0, 2).toUpperCase()}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-bold text-zinc-950 dark:text-white">{translateCompetitionName(competition, language)}</span>
          {country ? <span className="block truncate text-[0.68rem] font-medium text-stone-400 dark:text-zinc-500">{country}</span> : null}
        </span>
        <span className="rounded bg-stone-100 px-2 py-0.5 text-[0.68rem] font-semibold text-stone-600 dark:bg-zinc-800 dark:text-zinc-300">
          {matches.length} {matches.length === 1 ? t("match") : t("matches")}
        </span>
      </button>

      {!isCollapsed ? (
        <div className="divide-y divide-stone-100 dark:divide-zinc-900">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
