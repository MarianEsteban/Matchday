"use client";

import { useState } from "react";
import type { Match, MatchStatus } from "@/types/match";
import { MatchCard } from "@/components/matches/MatchCard";
import { formatMatchDate } from "@/data/mock/matches";

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

function createDateFromDateString(dateString: string) {
  return new Date(`${dateString}T00:00:00`);
}

function shiftDate(dateString: string, daysToShift: number) {
  const date = createDateFromDateString(dateString);
  date.setDate(date.getDate() + daysToShift);

  return formatMatchDate(date);
}

function formatSelectedDateLabel(dateString: string) {
  return new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(createDateFromDateString(dateString));
}

function filterMatchesByDate(matches: Match[], selectedDate: string) {
  return matches.filter((match) => match.date === selectedDate);
}

function filterMatches(matches: Match[], activeFilter: MatchFilter) {
  if (activeFilter === "all") {
    return matches;
  }

  return matches.filter((match) => match.status === activeFilter);
}

export function MatchList({ matches }: MatchListProps) {
  const [activeFilter, setActiveFilter] = useState<MatchFilter>("all");
  const [selectedDate, setSelectedDate] = useState(() =>
    matches[0]?.date ? matches[0].date : formatMatchDate(new Date()),
  );
  const [collapsedCompetitions, setCollapsedCompetitions] = useState<Record<string, boolean>>(
    {},
  );

  const matchesForSelectedDate = filterMatchesByDate(matches, selectedDate);
  const filteredMatches = filterMatches(matchesForSelectedDate, activeFilter);
  const groupedMatches = groupMatchesByCompetition(filteredMatches);
  const todayDate = formatMatchDate(new Date());

  function toggleCompetition(competition: string) {
    setCollapsedCompetitions((currentCollapsedCompetitions) => ({
      ...currentCollapsedCompetitions,
      [competition]: !currentCollapsedCompetitions[competition],
    }));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-3 shadow-sm shadow-black/20">
        <button
          type="button"
          onClick={() => setSelectedDate((currentDate) => shiftDate(currentDate, -1))}
          className="rounded-full border border-zinc-700 px-3 py-2 text-sm font-semibold text-zinc-200 transition-colors hover:border-zinc-500 hover:bg-zinc-800"
          aria-label="Ver partidos del día anterior"
        >
          ← Anterior
        </button>

        <p className="min-w-0 flex-1 text-center text-sm font-semibold capitalize text-zinc-100 sm:text-base">
          {formatSelectedDateLabel(selectedDate)}
        </p>

        <button
          type="button"
          onClick={() => setSelectedDate((currentDate) => shiftDate(currentDate, 1))}
          className="rounded-full border border-zinc-700 px-3 py-2 text-sm font-semibold text-zinc-200 transition-colors hover:border-zinc-500 hover:bg-zinc-800"
          aria-label="Ver partidos del día siguiente"
        >
          Siguiente →
        </button>

        <button
          type="button"
          onClick={() => setSelectedDate(todayDate)}
          className="rounded-full bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-950 shadow-sm shadow-white/10 transition-colors hover:bg-white"
        >
          Hoy
        </button>
      </div>

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

      {matchesForSelectedDate.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 text-zinc-300">
          No hay partidos programados para hoy.
        </div>
      ) : filteredMatches.length === 0 ? (
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
