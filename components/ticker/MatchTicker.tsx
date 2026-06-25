"use client";

import Image from "next/image";
import { usePreferences } from "@/components/ui/AppPreferences";
import { translateTeamName } from "@/lib/i18n";
import type { Match } from "@/types/match";

type MatchTickerProps = {
  matches: Match[];
};

function getMatchCenterText(match: Match) {
  if (match.score) {
    return `${match.score.home} - ${match.score.away}`;
  }

  return "vs";
}

function TickerItem({ match }: { match: Match }) {
  const { language, t } = usePreferences();
  const homeName = translateTeamName(match.homeTeam.name, language);
  const awayName = translateTeamName(match.awayTeam.name, language);
  const matchStatusText = match.status === "scheduled" ? match.kickoffTime : t("live");
  return (
    <li className="mx-5 inline-flex min-w-max items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/95 px-3 py-1.5 text-xs text-zinc-100 shadow-lg shadow-black/20 sm:mx-8 sm:gap-3 sm:px-5 sm:py-2 sm:text-sm">
      <Image
        src={match.homeTeam.crestUrl}
        alt={`${homeName} flag`}
        width={24}
        height={24}
        className="h-5 w-5 rounded-full object-cover ring-1 ring-white/15 sm:h-6 sm:w-6"
      />
      <span className="max-w-20 truncate font-semibold sm:max-w-none">{homeName}</span>
      <span className="rounded-full bg-amber-400 px-2 py-0.5 text-xs font-black uppercase tracking-wide text-zinc-950">
        {getMatchCenterText(match)}
      </span>
      <Image
        src={match.awayTeam.crestUrl}
        alt={`${awayName} flag`}
        width={24}
        height={24}
        className="h-5 w-5 rounded-full object-cover ring-1 ring-white/15 sm:h-6 sm:w-6"
      />
      <span className="max-w-20 truncate font-semibold sm:max-w-none">{awayName}</span>
      <span className="ml-1 rounded-full border border-zinc-700 px-2 py-0.5 text-xs uppercase tracking-wide text-zinc-400">
        {matchStatusText}
      </span>
    </li>
  );
}

export function MatchTicker({ matches }: MatchTickerProps) {
  const { t } = usePreferences();
  const displayMatches = matches.filter((match) => match.status === "live" || match.status === "scheduled");

  if (displayMatches.length === 0) {
    return null;
  }

  const tickerItems = [...displayMatches, ...displayMatches];

  return (
    <section className="border-b border-zinc-800 bg-zinc-950/95 py-2 text-white sm:py-3" aria-label={t("matchTicker")}>
      <div className="mb-1.5 flex items-center gap-2 px-4 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-amber-300 sm:mb-2 sm:px-6 sm:text-xs">
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
