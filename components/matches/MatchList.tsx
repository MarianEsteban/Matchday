"use client";

import { useState } from "react";
import type { Match } from "@/types/match";
import { CompetitionSection } from "@/components/matches/CompetitionSection";
import { DateSelector } from "@/components/matches/DateSelector";
import { EmptyMatchState } from "@/components/matches/EmptyMatchState";
import { MatchFilters, type MatchFilter } from "@/components/matches/MatchFilters";
import { formatMatchDate } from "@/data/mock/matches";

type MatchListProps = {
  matches: Match[];
};

type EmptyState = {
  icon: string;
  title: string;
  description: string;
};

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

function getEmptyState(activeFilter: MatchFilter, hasMatchesForSelectedDate: boolean): EmptyState {
  if (!hasMatchesForSelectedDate) {
    return {
      icon: "🗓️",
      title: "No hay partidos programados para esta fecha.",
      description: "Probá con otra fecha o volvé a la vista de hoy.",
    };
  }

  if (activeFilter === "live") {
    return {
      icon: "🔕",
      title: "No hay partidos en vivo ahora.",
      description: "Cuando empiece un partido, aparecerá en este filtro.",
    };
  }

  if (activeFilter === "scheduled") {
    return {
      icon: "⏳",
      title: "No hay próximos partidos para esta fecha.",
      description: "Revisá otra fecha para ver los partidos que vienen.",
    };
  }

  if (activeFilter === "finished") {
    return {
      icon: "🏁",
      title: "No hay partidos finalizados para esta fecha.",
      description: "Los resultados aparecerán cuando terminen los encuentros.",
    };
  }

  return {
    icon: "⚽",
    title: "No hay partidos para esta fecha.",
    description: "Probá con otra fecha para encontrar partidos disponibles.",
  };
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
  const emptyState = getEmptyState(activeFilter, matchesForSelectedDate.length > 0);

  function toggleCompetition(competition: string) {
    setCollapsedCompetitions((currentCollapsedCompetitions) => ({
      ...currentCollapsedCompetitions,
      [competition]: !currentCollapsedCompetitions[competition],
    }));
  }

  return (
    <div className="space-y-6">
      <DateSelector
        selectedDateLabel={formatSelectedDateLabel(selectedDate)}
        onSelectPreviousDate={() => setSelectedDate((currentDate) => shiftDate(currentDate, -1))}
        onSelectNextDate={() => setSelectedDate((currentDate) => shiftDate(currentDate, 1))}
        onSelectToday={() => setSelectedDate(todayDate)}
      />

      <MatchFilters activeFilter={activeFilter} onSelectFilter={setActiveFilter} />

      {filteredMatches.length === 0 ? (
        <EmptyMatchState {...emptyState} />
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedMatches).map(([competition, competitionMatches]) => (
            <CompetitionSection
              key={competition}
              competition={competition}
              matches={competitionMatches}
              isCollapsed={collapsedCompetitions[competition] ?? false}
              onToggle={toggleCompetition}
            />
          ))}
        </div>
      )}
    </div>
  );
}
