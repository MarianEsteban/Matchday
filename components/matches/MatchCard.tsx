import type { Match } from "@/types/match";

type MatchCardProps = {
  match: Match;
};

export function MatchCard({ match }: MatchCardProps) {
  return (
    <article className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-4 text-sm text-zinc-400">
        <span>{match.competition}</span>
        <time dateTime={`${match.date}T${match.kickoffTime}`}>{match.kickoffTime}</time>
      </div>

      <div className="grid gap-2 text-lg font-semibold sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <span>{match.homeTeam}</span>
        <span className="text-sm font-medium uppercase tracking-wide text-zinc-500">vs</span>
        <span className="sm:text-right">{match.awayTeam}</span>
      </div>

      <p className="mt-4 text-sm text-zinc-400">{match.venue}</p>
    </article>
  );
}
