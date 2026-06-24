"use client";

import { Trans, usePreferences } from "@/components/ui/AppPreferences";
import type { MatchStatistic } from "@/types/match-statistic";
import type { Match } from "@/types/match";

type MatchStatsProps = {
  match: Match;
  statistics: MatchStatistic[];
};

function formatValue(statistic: MatchStatistic, value: number) {
  return `${value}${statistic.unit ?? ""}`;
}

const statisticLabels = {
  es: { Posesión: "Posesión", Remates: "Remates", "Remates al arco": "Remates al arco", "Córners": "Córners", Faltas: "Faltas" },
  en: { Posesión: "Possession", Remates: "Shots", "Remates al arco": "Shots on target", "Córners": "Corners", Faltas: "Fouls" },
  pt: { Posesión: "Posse", Remates: "Finalizações", "Remates al arco": "Finalizações no alvo", "Córners": "Escanteios", Faltas: "Faltas" },
} as const;

function translateStatisticLabel(label: string, language: keyof typeof statisticLabels) {
  return statisticLabels[language][label as keyof typeof statisticLabels.es] ?? label;
}

export function MatchStats({ match, statistics }: MatchStatsProps) {
  const { language } = usePreferences();

  return (
    <section className="rounded-2xl border border-stone-300 bg-white/90 p-5 shadow-sm shadow-stone-300/30 dark:border-zinc-800 dark:bg-zinc-900/80 dark:shadow-black/20">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-amber-700 dark:text-amber-200"><Trans k="statistics" /></p>
          <h2 className="mt-1 text-xl font-semibold text-zinc-900 dark:text-zinc-100"><Trans k="matchComparison" /></h2>
        </div>
        <span className="rounded-full border border-stone-300 bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
          <Trans k="demoData" />
        </span>
      </div>

      {statistics.length > 0 ? (
        <div className="mt-6 space-y-5">
          <div className="grid grid-cols-[1fr_auto_1fr] gap-3 text-xs font-semibold uppercase tracking-wide text-stone-600 dark:text-zinc-500">
            <span className="truncate text-left">{match.homeTeam.name}</span>
            <span><Trans k="detail" /></span>
            <span className="truncate text-right">{match.awayTeam.name}</span>
          </div>

          {statistics.map((statistic) => {
            const total = statistic.values.home + statistic.values.away;
            const homePercentage = total > 0 ? (statistic.values.home / total) * 100 : 50;
            const awayPercentage = total > 0 ? (statistic.values.away / total) * 100 : 50;

            return (
              <div key={statistic.id} className="space-y-2">
                <div className="grid grid-cols-[3.5rem_1fr_3.5rem] items-center gap-3">
                  <span className="text-lg font-black tabular-nums text-zinc-950 dark:text-zinc-50">
                    {formatValue(statistic, statistic.values.home)}
                  </span>
                  <span className="text-center text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    {translateStatisticLabel(statistic.label, language)}
                  </span>
                  <span className="text-right text-lg font-black tabular-nums text-zinc-950 dark:text-zinc-50">
                    {formatValue(statistic, statistic.values.away)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-2 overflow-hidden rounded-full bg-stone-200 dark:bg-zinc-800">
                    <div
                      className="ml-auto h-full rounded-full bg-amber-300"
                      style={{ width: `${homePercentage}%` }}
                    />
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-stone-200 dark:bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-sky-300"
                      style={{ width: `${awayPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="mt-3 text-sm text-stone-600 dark:text-zinc-400"><Trans k="noMockStats" /></p>
      )}
    </section>
  );
}
