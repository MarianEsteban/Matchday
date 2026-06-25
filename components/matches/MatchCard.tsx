"use client";

import Image from "next/image";
import Link from "next/link";
import { usePreferences } from "@/components/ui/AppPreferences";
import { LocalizedKickoffTime } from "@/components/ui/LocalizedKickoff";
import { translateCompetitionName, translateTeamName } from "@/lib/i18n";
import type { Match, MatchStatus, Team } from "@/types/match";

type MatchCardProps = {
  match: Match;
};

const statusBadgeStyles: Record<MatchStatus, string> = {
  scheduled: "border-sky-600/30 bg-sky-100 text-sky-800 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200",
  live: "border-emerald-600/30 bg-emerald-100 text-emerald-800 shadow-emerald-500/10 dark:border-emerald-400/30 dark:bg-emerald-400/15 dark:text-emerald-200",
  finished: "border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-zinc-600/40 dark:bg-zinc-800 dark:text-zinc-300",
};

const statusLabelKeys: Record<MatchStatus, "upcoming" | "live" | "finished"> = {
  scheduled: "upcoming",
  live: "live",
  finished: "finished",
};

function TeamBlock({
  align = "left",
  team,
}: {
  align?: "left" | "right";
  team: Team;
}) {
  const isRightAligned = align === "right";

  return (
    <div className={`flex min-w-0 items-center gap-2 ${isRightAligned ? "flex-row-reverse text-right" : ""} sm:gap-3`}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-stone-300 bg-stone-100 text-sm font-bold text-zinc-900 shadow-inner shadow-white/5 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 sm:h-11 sm:w-11">
        <Image src={team.crestUrl} alt="" width={32} height={32} className="h-6 w-6 sm:h-8 sm:w-8" />
      </div>
      <span
        className={`min-w-0 truncate text-sm font-semibold leading-tight text-zinc-950 dark:text-zinc-50 sm:text-lg ${
          isRightAligned ? "text-right" : ""
        }`}
      >
        {team.name}
      </span>
    </div>
  );
}

export function MatchCard({ match }: MatchCardProps) {
  const { language, t } = usePreferences();
  const homeName = translateTeamName(match.homeTeam.name, language);
  const awayName = translateTeamName(match.awayTeam.name, language);
  const isLive = match.status === "live";

  return (
    <Link
      href={`/matches/${match.id}`}
      className="group block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
      aria-label={`${t("viewMatchDetail")} ${homeName} ${t("against")} ${awayName}`}
    >
      <article
        className={`relative overflow-hidden rounded-2xl border p-3 shadow-sm sm:p-5 transition-colors group-hover:border-amber-300/40 group-hover:bg-white group-hover:shadow-amber-200/30 dark:group-hover:bg-zinc-900 dark:group-hover:shadow-amber-950/20 ${
          isLive
            ? "border-emerald-500/40 bg-emerald-50 shadow-emerald-200/40 dark:border-emerald-400/30 dark:bg-emerald-950/20 dark:shadow-emerald-950/30"
            : "border-stone-300 bg-white/90 shadow-stone-300/30 dark:border-zinc-800 dark:bg-zinc-900/90 dark:shadow-black/20"
        }`}
      >
        {isLive ? <div className="absolute inset-y-0 left-0 w-1 bg-emerald-400" /> : null}

        <div className="flex items-start justify-between gap-2 pl-1">
          <div className="min-w-0 space-y-1.5 sm:space-y-2">
            <span className="inline-flex items-center rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-[0.68rem] sm:px-3 sm:text-xs font-medium uppercase tracking-wide text-amber-700 dark:text-amber-200">
              {translateCompetitionName(match.competition, language)}
            </span>
            <div className="truncate text-xs text-stone-600 dark:text-zinc-400 sm:text-sm">
              <time dateTime={match.kickoffAt ?? `${match.date}T${match.kickoffTime}`}><LocalizedKickoffTime date={match.date} kickoffTime={match.kickoffTime} kickoffAt={match.kickoffAt} /></time>
              <span className="mx-2 text-zinc-600">•</span>
              <span>{match.venue}</span>
            </div>
          </div>

          <span
            className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-wide shadow-sm sm:px-3 sm:text-xs ${statusBadgeStyles[match.status]}`}
          >
            {isLive ? <span className="mr-2 h-2 w-2 rounded-full bg-emerald-300" /> : null}
            {t(statusLabelKeys[match.status])}
          </span>
        </div>

        {match.standingsContext ? (
          <p className="mt-3 pl-1 text-xs font-semibold text-stone-500 dark:text-zinc-400">
            {translateCompetitionName(match.standingsContext.label, language)} · {match.standingsContext.homePosition}° vs {match.standingsContext.awayPosition}°
          </p>
        ) : null}

        <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 pl-1 sm:mt-6 sm:gap-4">
          <TeamBlock team={{ ...match.homeTeam, name: homeName }} />
          <div className="flex items-center justify-center rounded-full border border-stone-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] sm:px-3 sm:tracking-[0.2em] text-zinc-700 dark:text-zinc-500">
            {match.score ? `${match.score.home}-${match.score.away}` : "vs"}
          </div>
          <TeamBlock align="right" team={{ ...match.awayTeam, name: awayName }} />
        </div>
      </article>
    </Link>
  );
}
