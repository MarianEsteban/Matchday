import type { Match } from "@/types/match";
import { MatchCard } from "@/components/matches/MatchCard";

type MatchListProps = {
  matches: Match[];
};

const filterLabels = ["Todos", "En vivo", "Próximos", "Finalizados"];

function groupMatchesByCompetition(matches: Match[]) {
  return matches.reduce<Record<string, Match[]>>((groupedMatches, match) => {
    const competitionMatches = groupedMatches[match.competition] ?? [];

    return {
      ...groupedMatches,
      [match.competition]: [...competitionMatches, match],
    };
  }, {});
}

export function MatchList({ matches }: MatchListProps) {
  if (matches.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 text-zinc-300">
        No hay partidos programados para hoy.
      </div>
    );
  }

  const groupedMatches = groupMatchesByCompetition(matches);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-2 shadow-sm shadow-black/20">
        {filterLabels.map((label, index) => {
          const isActive = index === 0;

          return (
            <button
              key={label}
              type="button"
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-zinc-100 text-zinc-950 shadow-sm shadow-white/10"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="space-y-8">
        {Object.entries(groupedMatches).map(([competition, competitionMatches]) => (
          <section key={competition} className="space-y-4">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-zinc-100">{competition}</h3>
              <span className="h-px flex-1 bg-zinc-800" />
            </div>

            <div className="grid gap-4">
              {competitionMatches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
