"use client";

import { useState } from "react";
import { usePreferences } from "@/components/ui/AppPreferences";
import type { Match } from "@/types/match";
import { CompetitionSection } from "@/components/matches/CompetitionSection";
import { CompetitionSidebar } from "@/components/matches/CompetitionSidebar";
import { DateSelector } from "@/components/matches/DateSelector";
import { EmptyMatchState } from "@/components/matches/EmptyMatchState";
import { MatchFilters, type MatchFilter } from "@/components/matches/MatchFilters";
import { formatMatchDate } from "@/data/mock/matches";
import { formatCompactVisibleDate, formatVisibleDate, type TranslationKey } from "@/lib/i18n";

type MatchListProps = {
  matches: Match[];
};

type EmptyState = {
  icon: string;
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
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

function formatSelectedDateLabel(dateString: string, language: Parameters<typeof formatVisibleDate>[1]) {
  return formatVisibleDate(createDateFromDateString(dateString), language);
}

function formatCompactSelectedDateLabel(dateString: string, language: Parameters<typeof formatCompactVisibleDate>[1]) {
  return formatCompactVisibleDate(createDateFromDateString(dateString), language);
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
      titleKey: "noMatchesDateTitle",
      descriptionKey: "noMatchesDateDescription",
    };
  }

  if (activeFilter === "live") {
    return {
      icon: "🔕",
      titleKey: "noLiveTitle",
      descriptionKey: "noLiveDescription",
    };
  }

  if (activeFilter === "scheduled") {
    return {
      icon: "⏳",
      titleKey: "noUpcomingTitle",
      descriptionKey: "noUpcomingDescription",
    };
  }

  if (activeFilter === "finished") {
    return {
      icon: "🏁",
      titleKey: "noFinishedTitle",
      descriptionKey: "noFinishedDescription",
    };
  }

  return {
    icon: "⚽",
    titleKey: "noMatchesTitle",
    descriptionKey: "noMatchesDescription",
  };
}

export function MatchList({ matches }: MatchListProps) {
  const { language, t } = usePreferences();
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
  const competitionGroups = Object.entries(groupedMatches).map(([name, competitionMatches]) => ({
    name,
    matches: competitionMatches,
  }));
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
        selectedDateLabel={formatSelectedDateLabel(selectedDate, language)}
        compactSelectedDateLabel={formatCompactSelectedDateLabel(selectedDate, language)}
        onSelectPreviousDate={() => setSelectedDate((currentDate) => shiftDate(currentDate, -1))}
        onSelectNextDate={() => setSelectedDate((currentDate) => shiftDate(currentDate, 1))}
        onSelectToday={() => setSelectedDate(todayDate)}
      />

      <MatchFilters activeFilter={activeFilter} onSelectFilter={setActiveFilter} />

      {filteredMatches.length === 0 ? (
        <EmptyMatchState icon={emptyState.icon} title={t(emptyState.titleKey)} description={t(emptyState.descriptionKey)} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
          <CompetitionSidebar competitions={competitionGroups} />
          <div className="space-y-6 sm:space-y-8">
            {competitionGroups.map(({ name: competition, matches: competitionMatches }) => (
              <CompetitionSection
                key={competition}
                competition={competition}
                matches={competitionMatches}
                isCollapsed={collapsedCompetitions[competition] ?? false}
                onToggle={toggleCompetition}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
