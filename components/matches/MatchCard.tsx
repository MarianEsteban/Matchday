import Link from "next/link";
import type { Match, MatchStatus } from "@/types/match";

type MatchCardProps = {
  match: Match;
};

const statusBadgeStyles: Record<MatchStatus, string> = {
  scheduled: "border-sky-500/20 bg-sky-500/10 text-sky-200",
  live: "border-emerald-400/30 bg-emerald-400/15 text-emerald-200 shadow-emerald-500/10",
  finished: "border-zinc-600/40 bg-zinc-800 text-zinc-300",
};

const statusLabels: Record<MatchStatus, string> = {
  scheduled: "Scheduled",
  live: "Live",
  finished: "Finished",
};

function getTeamInitials(teamName: string) {
  return teamName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function TeamBlock({
  align = "left",
  teamName,
}: {
  align?: "left" | "right";
  teamName: string;
}) {
  const isRightAligned = align === "right";

  return (
    <div className={`flex items-center gap-3 ${isRightAligned ? "sm:flex-row-reverse" : ""}`}>
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-sm font-bold text-zinc-100 shadow-inner shadow-white/5">
        {getTeamInitials(teamName)}
      </div>
      <span
        className={`text-base font-semibold text-zinc-50 sm:text-lg ${
          isRightAligned ? "sm:text-right" : ""
        }`}
      >
        {teamName}
      </span>
    </div>
  );
}

export function MatchCard({ match }: MatchCardProps) {
  const isLive = match.status === "live";

  return (
    <Link
      href={`/matches/${match.id}`}
      className="group block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
      aria-label={`Ver detalle de ${match.homeTeam} contra ${match.awayTeam}`}
    >
      <article
        className={`relative overflow-hidden rounded-2xl border p-5 shadow-sm transition-colors group-hover:border-amber-300/40 group-hover:bg-zinc-900 group-hover:shadow-amber-950/20 ${
          isLive
            ? "border-emerald-400/30 bg-emerald-950/20 shadow-emerald-950/30"
            : "border-zinc-800 bg-zinc-900/90 shadow-black/20"
        }`}
      >
        {isLive ? <div className="absolute inset-y-0 left-0 w-1 bg-emerald-400" /> : null}

        <div className="flex flex-wrap items-start justify-between gap-3 pl-1">
          <div className="space-y-2">
            <span className="inline-flex items-center rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-amber-200">
              {match.competition}
            </span>
            <div className="text-sm text-zinc-400">
              <time dateTime={`${match.date}T${match.kickoffTime}`}>{match.kickoffTime}</time>
              <span className="mx-2 text-zinc-600">•</span>
              <span>{match.venue}</span>
            </div>
          </div>

          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide shadow-sm ${statusBadgeStyles[match.status]}`}
          >
            {isLive ? <span className="mr-2 h-2 w-2 rounded-full bg-emerald-300" /> : null}
            {statusLabels[match.status]}
          </span>
        </div>

        <div className="mt-6 grid gap-4 pl-1 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
          <TeamBlock teamName={match.homeTeam} />
          <div className="flex items-center justify-center rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            {match.score ? `${match.score.home}-${match.score.away}` : "vs"}
          </div>
          <TeamBlock align="right" teamName={match.awayTeam} />
        </div>
      </article>
    </Link>
  );
}
