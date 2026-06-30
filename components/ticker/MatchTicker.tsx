"use client";

import Image from "next/image";
import { usePreferences } from "@/components/ui/AppPreferences";
import { LocalizedKickoffTime } from "@/components/ui/LocalizedKickoff";
import { translateTeamName } from "@/lib/i18n";
import { getCompetitionSortPriority, isFeaturedCompetitionMatch } from "@/data/mock/competitions";
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
  const matchStatusText = match.status === "scheduled" ? <LocalizedKickoffTime date={match.date} kickoffTime={match.kickoffTime} kickoffAt={match.kickoffAt} /> : t("live");
  return (
    <li className="mx-2 inline-flex min-w-max items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-xs text-zinc-100 shadow-sm shadow-black/10 sm:mx-3 sm:gap-2.5 sm:px-3">
      <Image
        src={match.homeTeam.crestUrl}
        alt={`${homeName} flag`}
        width={24}
        height={24}
        className="h-5 w-5 rounded-full object-contain ring-1 ring-white/15"
      />
      <span className="max-w-20 truncate font-semibold sm:max-w-none">{homeName}</span>
      <span className="rounded-md bg-white px-2 py-0.5 text-xs font-black uppercase tracking-wide text-zinc-950">
        {getMatchCenterText(match)}
      </span>
      <Image
        src={match.awayTeam.crestUrl}
        alt={`${awayName} flag`}
        width={24}
        height={24}
        className="h-5 w-5 rounded-full object-contain ring-1 ring-white/15"
      />
      <span className="max-w-20 truncate font-semibold sm:max-w-none">{awayName}</span>
      <span className="ml-1 rounded-full bg-emerald-400/10 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-emerald-200">
        {matchStatusText}
      </span>
    </li>
  );
}

export function MatchTicker({ matches }: MatchTickerProps) {
  const { t } = usePreferences();
  const displayMatches = matches
    .filter((match) => (match.status === "live" || match.status === "scheduled")
      && isFeaturedCompetitionMatch(match))
    .sort((firstMatch, secondMatch) => {
      const priorityDifference = getCompetitionSortPriority(firstMatch.competition) - getCompetitionSortPriority(secondMatch.competition);

      if (priorityDifference !== 0) return priorityDifference;

      return (firstMatch.kickoffAt ?? firstMatch.kickoffTime).localeCompare(secondMatch.kickoffAt ?? secondMatch.kickoffTime);
    });

  if (displayMatches.length === 0) {
    return null;
  }

  const tickerItems = [...displayMatches, ...displayMatches];

  return (
    <section className="border-b border-zinc-800 bg-zinc-950/96 py-1.5 text-white" aria-label={t("matchTicker")}>
      <div className="mb-1 flex items-center gap-2 px-4 text-[0.62rem] font-black uppercase tracking-[0.18em] text-emerald-300 sm:px-6">
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
