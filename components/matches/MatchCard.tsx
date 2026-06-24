"use client";

import Image from "next/image";
import Link from "next/link";
import { usePreferences } from "@/components/ui/AppPreferences";
import { translateCompetitionName } from "@/lib/i18n";
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
    <div className={`flex items-center gap-3 ${isRightAligned ? "sm:flex-row-reverse" : ""}`}>
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-stone-300 bg-stone-100 dark:border-zinc-700 dark:bg-zinc-800 text-sm font-bold text-zinc-900 dark:text-zinc-100 shadow-inner shadow-white/5">
        <Image src={team.crestUrl} alt="" width={32} height={32} className="h-8 w-8" />
      </div>
      <span
        className={`text-base font-semibold text-zinc-950 dark:text-zinc-50 sm:text-lg ${
          isRightAligned ? "sm:text-right" : ""
        }`}
      >
        {team.name}
      </span>
    </div>
  );
}

export function MatchCard({ match }: MatchCardProps) {
  const { language, t } = usePreferences();
  const isLive = match.status === "live";

  return (
    <Link
      href={`/matches/${match.id}`}
      className="group block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
      aria-label={`${t("viewMatchDetail")} ${match.homeTeam.name} ${t("against")} ${match.awayTeam.name}`}
    >
      <article
        className={`relative overflow-hidden rounded-2xl border p-5 shadow-sm transition-colors group-hover:border-amber-300/40 group-hover:bg-white group-hover:shadow-amber-200/30 dark:group-hover:bg-zinc-900 dark:group-hover:shadow-amber-950/20 ${
          isLive
            ? "border-emerald-500/40 bg-emerald-50 shadow-emerald-200/40 dark:border-emerald-400/30 dark:bg-emerald-950/20 dark:shadow-emerald-950/30"
            : "border-stone-300 bg-white/90 shadow-stone-300/30 dark:border-zinc-800 dark:bg-zinc-900/90 dark:shadow-black/20"
        }`}
      >
        {isLive ? <div className="absolute inset-y-0 left-0 w-1 bg-emerald-400" /> : null}

        <div className="flex flex-wrap items-start justify-between gap-3 pl-1">
          <div className="space-y-2">
            <span className="inline-flex items-center rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-amber-700 dark:text-amber-200">
              {translateCompetitionName(match.competition, language)}
            </span>
            <div className="text-sm text-stone-600 dark:text-zinc-400">
              <time dateTime={`${match.date}T${match.kickoffTime}`}>{match.kickoffTime}</time>
              <span className="mx-2 text-zinc-600">•</span>
              <span>{match.venue}</span>
            </div>
          </div>

          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide shadow-sm ${statusBadgeStyles[match.status]}`}
          >
            {isLive ? <span className="mr-2 h-2 w-2 rounded-full bg-emerald-300" /> : null}
            {t(statusLabelKeys[match.status])}
          </span>
        </div>

        <div className="mt-6 grid gap-4 pl-1 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
          <TeamBlock team={match.homeTeam} />
          <div className="flex items-center justify-center rounded-full border border-stone-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-700 dark:text-zinc-500">
            {match.score ? `${match.score.home}-${match.score.away}` : "vs"}
          </div>
          <TeamBlock align="right" team={match.awayTeam} />
        </div>
      </article>
    </Link>
  );
}
