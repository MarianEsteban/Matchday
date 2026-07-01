"use client";

import Image from "next/image";
import Link from "next/link";
import { usePreferences } from "@/components/ui/AppPreferences";
import { LocalizedKickoffTime } from "@/components/ui/LocalizedKickoff";
import { translateTeamName } from "@/lib/i18n";
import type { Match, MatchStatus, Team } from "@/types/match";

type MatchCardProps = { match: Match };

const statusBadgeStyles: Record<MatchStatus, string> = {
  scheduled: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  live: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
  finished: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-300",
};

const statusLabelKeys: Record<MatchStatus, "upcoming" | "live" | "finished"> = {
  scheduled: "upcoming",
  live: "live",
  finished: "finished",
};

function TeamCell({ team, align = "left" }: { team: Team; align?: "left" | "right" }) {
  return (
    <div className={`flex min-w-0 items-center gap-2 ${align === "right" ? "flex-row-reverse text-right" : ""}`}>
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/20 sm:h-7 sm:w-7">
        <Image src={team.crestUrl} alt={`${team.name} crest`} width={24} height={24} className="h-4 w-4 object-contain sm:h-5 sm:w-5" />
      </span>
      <span className="min-w-0 truncate text-[0.8rem] font-semibold text-zinc-950 dark:text-zinc-50 sm:text-sm">{team.name}</span>
    </div>
  );
}

export function MatchCard({ match }: MatchCardProps) {
  const { language, t } = usePreferences();
  const homeName = translateTeamName(match.homeTeam.name, language);
  const awayName = translateTeamName(match.awayTeam.name, language);
  const isLive = match.status === "live";
  const scoreText = match.score ? `${match.score.home}–${match.score.away}` : "VS";
  const penaltiesText = match.penalties ? `P ${match.penalties.home}–${match.penalties.away}` : null;
  const isHighlighted = match.importance === "featured";

  return (
    <Link
      href={`/matches/${match.id}`}
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fbf7ee] dark:focus-visible:ring-offset-zinc-950"
      aria-label={`${t("viewMatchDetail")} ${homeName} ${t("against")} ${awayName}`}
    >
      <article className={`relative grid grid-cols-[3.1rem_minmax(0,1fr)_auto] items-center gap-2 px-2.5 py-2 transition hover:bg-stone-50/90 dark:hover:bg-zinc-900/80 sm:grid-cols-[4.4rem_minmax(0,1fr)_auto] sm:px-4 ${isLive ? "bg-emerald-50/75 dark:bg-emerald-950/16" : ""} ${isHighlighted ? "before:absolute before:inset-y-2 before:left-0 before:w-1 before:rounded-r-full before:bg-stone-400" : ""}`}>
        <div className="text-left">
          <div className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[0.68rem] font-semibold ${isLive ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-stone-100 text-stone-500 dark:bg-zinc-900 dark:text-zinc-400"}`}>
            {isLive ? <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> : null}
            {isLive ? t("live") : <LocalizedKickoffTime date={match.date} kickoffTime={match.kickoffTime} kickoffAt={match.kickoffAt} />}
          </div>
        </div>

        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_3.4rem_minmax(0,1fr)] items-center gap-2 sm:grid-cols-[minmax(0,1fr)_4rem_minmax(0,1fr)]">
          <TeamCell team={{ ...match.homeTeam, name: homeName }} />
          <span className={`rounded-lg px-1.5 py-1 text-center text-sm font-bold ${match.score ? "text-zinc-950 dark:text-white" : "text-stone-400 dark:text-zinc-500"}`}>
            <span className="block leading-none">{scoreText}</span>
            {penaltiesText ? <span className="mt-0.5 block text-[0.55rem] font-semibold text-stone-500 dark:text-zinc-400">{penaltiesText}</span> : null}
          </span>
          <TeamCell align="right" team={{ ...match.awayTeam, name: awayName }} />
          {match.venue ? <span className="col-span-3 hidden truncate text-center text-[0.68rem] font-medium text-stone-400 dark:text-zinc-600 sm:block">{match.venue}</span> : null}
        </div>

        <span className={`justify-self-end rounded px-1.5 py-0.5 text-[0.62rem] font-semibold ${statusBadgeStyles[match.status]}`}>
          {t(statusLabelKeys[match.status])}
        </span>
      </article>
    </Link>
  );
}
