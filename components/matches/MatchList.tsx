"use client";

import { useState } from "react";
import type { Match, MatchStatus } from "@/types/match";
import { MatchCard } from "@/components/matches/MatchCard";

type MatchListProps = {
  matches: Match[];
};

type MatchFilter = "all" | MatchStatus;

type MatchFilterOption = {
  label: string;
  value: MatchFilter;
};

const filterOptions: MatchFilterOption[] = [
  { label: "Todos", value: "all" },
  { label: "En vivo", value: "live" },
  { label: "Próximos", value: "scheduled" },
  { label: "Finalizados", value: "finished" },
];

function groupMatchesByCompetition(matches: Match[]) {
  return matches.reduce<Record<string, Match[]>>((groupedMatches, match) => {
    const competitionMatches = groupedMatches[match.competition] ?? [];

    return {
      ...groupedMatches,
      [match.competition]: [...competitionMatches, match],
    };
  }, {});
}

function filterMatches(matches: Match[], activeFilter: MatchFilter) {
  if (activeFilter === "all") {
    return matches;
  }

  return matches.filter((match) => match.status === activeFilter);
}

export function MatchList({ matches }: MatchListProps) {
  const [activeFilter, setActiveFilter] = useState<MatchFilter>("all");
  const [collapsedCompetitions, setCollapsedCompetitions] = useState<Record<string, boolean>>(
    {},
  );

  if (matches.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 text-zinc-300">
        No hay partidos programados para hoy.
      </div>
    );
  }

  const filteredMatches = filterMatches(matches, activeFilter);
  const groupedMatches = groupMatchesByCompetition(filteredMatches);

  function toggleCompetition(competition: string) {
    setCollapsedCompetitions((currentCollapsedCompetitions) => ({
      ...currentCollapsedCompetitions,
      [competition]: !currentCollapsedCompetitions[competition],
    }));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-2 shadow-sm shadow-black/20">
        {filterOptions.map(({ label, value }) => {
          const isActive = activeFilter === value;

          return (
            <button
              key={value}
              type="button"
              onClick={() => setActiveFilter(value)}
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

      {filteredMatches.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 text-zinc-300">
          No hay partidos para este filtro.
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedMatches).map(([competition, competitionMatches]) => {
            const isCollapsed = collapsedCompetitions[competition] ?? false;
            const sectionId = `competition-${competition
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")}`;

            return (
              <section key={competition} className="space-y-4">
                <button
                  type="button"
                  onClick={() => toggleCompetition(competition)}
                  aria-expanded={!isCollapsed}
                  aria-controls={sectionId}
                  className="group flex w-full items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/80 px-4 py-3 text-left shadow-sm shadow-black/20 transition-colors hover:border-zinc-700 hover:bg-zinc-900"
                >
                  <span
                    aria-hidden="true"
                    className={`text-zinc-400 transition-transform group-hover:text-zinc-100 ${
                      isCollapsed ? "-rotate-90" : "rotate-0"
                    }`}
                  >
                    ▾
                  </span>
                  <h3 className="text-lg font-semibold text-zinc-100">{competition}</h3>
                  <span className="h-px flex-1 bg-zinc-800" />
                  <span className="rounded-full border border-zinc-700 bg-zinc-950 px-3 py-1 text-sm font-semibold text-zinc-300">
                    {competitionMatches.length}{" "}
                    {competitionMatches.length === 1 ? "match" : "matches"}
                  </span>
                </button>

                {!isCollapsed ? (
                  <div id={sectionId} className="grid gap-4">
                    {competitionMatches.map((match) => (
                      <MatchCard key={match.id} match={match} />
                    ))}
                  </div>
                ) : null}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
