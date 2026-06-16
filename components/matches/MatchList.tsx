import type { Match } from "@/types/match";
import { MatchCard } from "@/components/matches/MatchCard";

type MatchListProps = {
  matches: Match[];
};

export function MatchList({ matches }: MatchListProps) {
  if (matches.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 text-zinc-300">
        No hay partidos programados para hoy.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {matches.map((match) => (
        <MatchCard key={match.id} match={match} />
      ))}
    </div>
  );
}
