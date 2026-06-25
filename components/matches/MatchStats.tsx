"use client";

import { Trans, usePreferences } from "@/components/ui/AppPreferences";
import { translateTeamName } from "@/lib/i18n";
import type { MatchStatistic } from "@/types/match-statistic";
import type { Match, MatchListDataSource } from "@/types/match";

type MatchStatsProps = {
  match: Match;
  statistics: MatchStatistic[];
  dataSource?: MatchListDataSource;
};

function formatValue(statistic: MatchStatistic, value: number) {
  return `${value}${statistic.unit ?? ""}`;
}

const statisticLabels = {
  es: {
    Posesión: "Posesión",
    "Ball Possession": "Posesión",
    Remates: "Remates",
    "Total Shots": "Remates",
    "Remates al arco": "Remates al arco",
    "Shots on Goal": "Remates al arco",
    "Shots on target": "Remates al arco",
    Córners: "Córners",
    "Corner Kicks": "Córners",
    Faltas: "Faltas",
    Fouls: "Faltas",
    "Yellow Cards": "Amarillas",
    "Passes %": "Precisión de pase",
  },
  en: {
    Posesión: "Possession",
    "Ball Possession": "Possession",
    Remates: "Total shots",
    "Total Shots": "Total shots",
    "Remates al arco": "Shots on goal",
    "Shots on Goal": "Shots on goal",
    "Shots on target": "Shots on target",
    Córners: "Corners",
    "Corner Kicks": "Corners",
    Faltas: "Fouls",
    Fouls: "Fouls",
    "Yellow Cards": "Yellow cards",
    "Passes %": "Pass accuracy",
  },
  pt: {
    Posesión: "Posse",
    "Ball Possession": "Posse",
    Remates: "Finalizações",
    "Total Shots": "Finalizações",
    "Remates al arco": "Finalizações no alvo",
    "Shots on Goal": "Finalizações no alvo",
    "Shots on target": "Finalizações no alvo",
    Córners: "Escanteios",
    "Corner Kicks": "Escanteios",
    Faltas: "Faltas",
    Fouls: "Faltas",
    "Yellow Cards": "Cartões amarelos",
    "Passes %": "Precisão de passe",
  },
} as const;

const statPriority = ["shots on goal", "shots on target", "remates al arco", "total shots", "remates", "ball possession", "posesión", "corner kicks", "córners", "fouls", "faltas", "yellow cards", "passes %"];

function translateStatisticLabel(label: string, language: keyof typeof statisticLabels) {
  return statisticLabels[language][label as keyof typeof statisticLabels.es] ?? label;
}

function sortStatistics(statistics: MatchStatistic[]) {
  return [...statistics].sort((a, b) => {
    const aIndex = statPriority.indexOf(a.label.toLowerCase());
    const bIndex = statPriority.indexOf(b.label.toLowerCase());
    return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
  });
}

export function MatchStats({ match, statistics, dataSource = "demo" }: MatchStatsProps) {
  const { language } = usePreferences();
  const sortedStatistics = sortStatistics(statistics);

  return (
    <section className="overflow-hidden rounded-3xl border border-stone-300 bg-white/90 shadow-lg shadow-stone-300/25 dark:border-zinc-800 dark:bg-zinc-900/80 dark:shadow-black/20">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 bg-stone-50/80 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/50 sm:px-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-700 dark:text-amber-200"><Trans k="statistics" /></p>
          <h2 className="mt-1 text-lg font-black text-zinc-900 dark:text-zinc-100"><Trans k="matchComparison" /></h2>
        </div>
        <span className="rounded-full border border-stone-300 bg-white px-3 py-1 text-xs font-semibold text-stone-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
          {dataSource === "api-football" ? <Trans k="apiFootballData" /> : <Trans k="demoData" />}
        </span>
      </div>

      {sortedStatistics.length > 0 ? (
        <div className="p-4 sm:p-5">
          <div className="mb-3 grid grid-cols-[4.25rem_minmax(0,1fr)_4.25rem] items-center gap-3 text-[0.68rem] font-black uppercase tracking-[0.18em] text-stone-500 dark:text-zinc-500 sm:grid-cols-[5rem_minmax(0,1fr)_5rem]">
            <span className="truncate text-left">{translateTeamName(match.homeTeam.name, language)}</span>
            <span className="text-center"><Trans k="detail" /></span>
            <span className="truncate text-right">{translateTeamName(match.awayTeam.name, language)}</span>
          </div>

          <div className="grid gap-2 lg:grid-cols-2">
            {sortedStatistics.map((statistic) => {
              const total = statistic.values.home + statistic.values.away;
              const homePercentage = total > 0 ? (statistic.values.home / total) * 100 : 50;
              const awayPercentage = total > 0 ? (statistic.values.away / total) * 100 : 50;

              return (
                <article key={statistic.id} className="rounded-2xl border border-stone-200 bg-stone-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-950/55">
                  <div className="grid grid-cols-[3.75rem_minmax(0,1fr)_3.75rem] items-center gap-2 sm:grid-cols-[4.5rem_minmax(0,1fr)_4.5rem]">
                    <span className="text-lg font-black tabular-nums text-zinc-950 dark:text-zinc-50">
                      {formatValue(statistic, statistic.values.home)}
                    </span>
                    <span className="text-center text-xs font-bold uppercase tracking-wide text-zinc-700 dark:text-zinc-300">
                      {translateStatisticLabel(statistic.label, language)}
                    </span>
                    <span className="text-right text-lg font-black tabular-nums text-zinc-950 dark:text-zinc-50">
                      {formatValue(statistic, statistic.values.away)}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-1.5">
                    <div className="h-1.5 overflow-hidden rounded-full bg-stone-200 dark:bg-zinc-800">
                      <div className="ml-auto h-full rounded-full bg-amber-400" style={{ width: `${homePercentage}%` }} />
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-stone-200 dark:bg-zinc-800">
                      <div className="h-full rounded-full bg-sky-400" style={{ width: `${awayPercentage}%` }} />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="m-4 rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-6 text-center dark:border-zinc-700 dark:bg-zinc-950/50">
          <p className="text-sm font-semibold text-stone-600 dark:text-zinc-400"><Trans k="noMockStats" /></p>
        </div>
      )}
    </section>
  );
}
