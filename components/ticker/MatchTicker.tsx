"use client";

import Image from "next/image";
import { usePreferences } from "@/components/ui/AppPreferences";
import type { Match, MatchStatus } from "@/types/match";

type MatchTickerProps = {
  matches: Match[];
};

const tickerStatusLabelKeys: Record<Exclude<MatchStatus, "scheduled">, "live" | "fullTime"> = {
  live: "live",
  finished: "fullTime",
};

function getMatchCenterText(match: Match) {
  if (match.score) {
    return `${match.score.home} - ${match.score.away}`;
  }

  return "vs";
}

function TickerItem({ match }: { match: Match }) {
  const { t } = usePreferences();
  const matchStatusText = match.status === "scheduled" ? match.kickoffTime : t(tickerStatusLabelKeys[match.status]);
  return (
    <li className="mx-3 inline-flex min-w-max items-center gap-3 rounded-full border border-zinc-800 bg-zinc-900/95 px-4 py-2 text-sm text-zinc-100 shadow-lg shadow-black/20 sm:mx-4 sm:px-5">
      <Image
        src={match.homeTeam.crestUrl}
        alt={`${match.homeTeam.name} flag`}
        width={24}
        height={24}
        className="h-6 w-6 rounded-full object-cover ring-1 ring-white/15"
      />
      <span className="max-w-28 truncate font-semibold sm:max-w-none">{match.homeTeam.name}</span>
      <span className="rounded-full bg-amber-400 px-2 py-0.5 text-xs font-black uppercase tracking-wide text-zinc-950">
        {getMatchCenterText(match)}
      </span>
      <Image
        src={match.awayTeam.crestUrl}
        alt={`${match.awayTeam.name} flag`}
        width={24}
        height={24}
        className="h-6 w-6 rounded-full object-cover ring-1 ring-white/15"
      />
      <span className="max-w-28 truncate font-semibold sm:max-w-none">{match.awayTeam.name}</span>
      <span className="ml-1 rounded-full border border-zinc-700 px-2 py-0.5 text-xs uppercase tracking-wide text-zinc-400">
        {matchStatusText}
      </span>
    </li>
  );
}

export function MatchTicker({ matches }: MatchTickerProps) {
  const { t } = usePreferences();
  if (matches.length === 0) {
    return null;
  }

  const tickerItems = [...matches, ...matches];

  return (
    <section className="border-b border-zinc-800 bg-zinc-950/95 py-3 text-white" aria-label="Top match ticker">
      <div className="mb-2 flex items-center gap-2 px-4 text-xs font-bold uppercase tracking-[0.2em] text-amber-300 sm:px-6">
        <span className="h-2 w-2 rounded-full bg-emerald-400" />
        {t("matchTicker")}
      </div>
      <div className="ticker-mask overflow-hidden whitespace-nowrap" role="list" aria-label={t("todaysMatches")}>
        <ul className="ticker-track inline-flex w-max animate-match-ticker hover:[animation-play-state:paused]">
          {tickerItems.map((match, index) => (
            <TickerItem key={`${match.id}-${index}`} match={match} />
          ))}
        </ul>
      </div>
    </section>
  );
}
