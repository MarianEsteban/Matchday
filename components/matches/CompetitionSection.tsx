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

export function CompetitionSection({
  competition,
  matches,
  isCollapsed,
  onToggle,
}: CompetitionSectionProps) {
  const { language, t } = usePreferences();
  const sectionId = createCompetitionSectionId(competition);

  return (
    <section id={sectionId} className="scroll-mt-6 space-y-4">
      <button
        type="button"
        onClick={() => onToggle(competition)}
        aria-expanded={!isCollapsed}
        aria-controls={sectionId}
        className="group flex w-full items-center gap-3 rounded-2xl border border-stone-300 bg-white/80 px-4 py-3 text-left shadow-sm shadow-stone-300/30 transition-colors hover:border-stone-400 hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/80 dark:shadow-black/20 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
      >
        <span
          aria-hidden="true"
          className={`text-stone-600 transition-transform group-hover:text-zinc-900 dark:text-zinc-400 dark:group-hover:text-zinc-100 ${
            isCollapsed ? "-rotate-90" : "rotate-0"
          }`}
        >
          ▾
        </span>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{translateCompetitionName(competition, language)}</h3>
        <span className="h-px flex-1 bg-stone-300 dark:bg-zinc-800" />
        <span className="rounded-full border border-stone-300 bg-white px-3 py-1 text-sm font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
          {matches.length} {matches.length === 1 ? t("match") : t("matches")}
        </span>
      </button>

      {!isCollapsed ? (
        <div className="grid gap-4">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
