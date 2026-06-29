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
    "Red Cards": "Rojas",
    "Total passes": "Pases",
    Passes: "Pases",
    "Passes %": "Precisión de pase",
    "Expected Goals": "Goles esperados",
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
    "Red Cards": "Red cards",
    "Total passes": "Passes",
    Passes: "Passes",
    "Passes %": "Pass accuracy",
    "Expected Goals": "Expected goals",
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
    "Red Cards": "Cartões vermelhos",
    "Total passes": "Passes",
    Passes: "Passes",
    "Passes %": "Precisão de passe",
    "Expected Goals": "Gols esperados",
  },
} as const;

const keyStats = ["ball possession", "posesión", "shots on goal", "shots on target", "remates al arco", "total shots", "remates", "corner kicks", "córners", "fouls", "faltas", "yellow cards", "red cards", "total passes", "passes", "passes %", "expected goals", "xg"];

function translateStatisticLabel(label: string, language: keyof typeof statisticLabels) {
  return statisticLabels[language][label as keyof typeof statisticLabels.es] ?? label;
}

function priorityIndex(label: string) {
  const index = keyStats.indexOf(label.toLowerCase());
  return index === -1 ? 99 : index;
}

function sortStatistics(statistics: MatchStatistic[]) {
  return [...statistics].sort((a, b) => priorityIndex(a.label) - priorityIndex(b.label));
}

function StatRow({ statistic, language }: { statistic: MatchStatistic; language: keyof typeof statisticLabels }) {
  const total = statistic.values.home + statistic.values.away;
  const homePercentage = total > 0 ? (statistic.values.home / total) * 100 : 50;
  const awayPercentage = total > 0 ? (statistic.values.away / total) * 100 : 50;

  return (
    <article className="rounded-2xl border border-stone-200 bg-white px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-950/60">
      <div className="grid grid-cols-[3rem_minmax(0,1fr)_3rem] items-center gap-2">
        <span className="text-sm font-black tabular-nums text-zinc-950 dark:text-zinc-50">{formatValue(statistic, statistic.values.home)}</span>
        <span className="truncate text-center text-[0.72rem] font-bold uppercase tracking-wide text-zinc-700 dark:text-zinc-300">{translateStatisticLabel(statistic.label, language)}</span>
        <span className="text-right text-sm font-black tabular-nums text-zinc-950 dark:text-zinc-50">{formatValue(statistic, statistic.values.away)}</span>
      </div>
      <div className="mt-2 flex h-1.5 overflow-hidden rounded-full bg-stone-200 dark:bg-zinc-800" aria-hidden="true">
        <div className="bg-amber-400" style={{ width: `${homePercentage}%` }} />
        <div className="bg-sky-400" style={{ width: `${awayPercentage}%` }} />
      </div>
    </article>
  );
}

export function MatchStats({ match, statistics, dataSource = "demo" }: MatchStatsProps) {
  const { language } = usePreferences();
  const sortedStatistics = sortStatistics(statistics);
  const prioritizedStatistics = sortedStatistics.filter((statistic) => priorityIndex(statistic.label) !== 99);
  const primaryStatistics = (prioritizedStatistics.length ? prioritizedStatistics : sortedStatistics).slice(0, 7);
  const extraStatistics = sortedStatistics.filter((statistic) => !primaryStatistics.some((primary) => primary.id === statistic.id));

  return (
    <section className="overflow-hidden rounded-3xl border border-stone-300 bg-white/90 shadow-lg shadow-stone-300/25 dark:border-zinc-800 dark:bg-zinc-900/80 dark:shadow-black/20">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 bg-stone-50/80 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/50 sm:px-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-700 dark:text-amber-200"><Trans k="statistics" /></p>
          <h2 className="mt-1 text-lg font-black text-zinc-900 dark:text-zinc-100"><Trans k="matchComparison" /></h2>
        </div>
        <span className="rounded-full border border-stone-300 bg-white px-3 py-1 text-xs font-semibold text-stone-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
          {dataSource === "api-football" || dataSource === "cached-api-football" ? <Trans k="apiFootballData" /> : <Trans k="demoData" />}
        </span>
      </div>

      {sortedStatistics.length > 0 ? (
        <div className="p-4 sm:p-5">
          <div className="mb-3 grid grid-cols-[4.25rem_minmax(0,1fr)_4.25rem] items-center gap-3 text-[0.68rem] font-black uppercase tracking-[0.16em] text-stone-500 dark:text-zinc-500">
            <span className="truncate text-left">{translateTeamName(match.homeTeam.name, language)}</span>
            <span className="text-center"><Trans k="detail" /></span>
            <span className="truncate text-right">{translateTeamName(match.awayTeam.name, language)}</span>
          </div>

          <div className="grid gap-2">
            {primaryStatistics.map((statistic) => <StatRow key={statistic.id} statistic={statistic} language={language} />)}
          </div>

          {extraStatistics.length ? (
            <details className="mt-3 rounded-2xl border border-stone-200 bg-stone-50/70 dark:border-zinc-800 dark:bg-zinc-950/40">
              <summary className="cursor-pointer px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-stone-500 marker:text-amber-600 dark:text-zinc-500"><Trans k="moreStats" /></summary>
              <div className="grid gap-2 border-t border-stone-200 p-2 dark:border-zinc-800">
                {extraStatistics.map((statistic) => <StatRow key={statistic.id} statistic={statistic} language={language} />)}
              </div>
            </details>
          ) : null}
        </div>
      ) : (
        <div className="m-4 rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-6 text-center dark:border-zinc-700 dark:bg-zinc-950/50">
          <p className="text-sm font-semibold text-stone-600 dark:text-zinc-400"><Trans k="statisticsUnavailable" /></p>
        </div>
      )}
    </section>
  );
}
