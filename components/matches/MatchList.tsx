"use client";

import { useEffect, useState } from "react";
import { usePreferences } from "@/components/ui/AppPreferences";
import type { Match, MatchListDataSource } from "@/types/match";
import { CompetitionSection } from "@/components/matches/CompetitionSection";
import { CompetitionSidebar } from "@/components/matches/CompetitionSidebar";
import { DateSelector } from "@/components/matches/DateSelector";
import { EmptyMatchState } from "@/components/matches/EmptyMatchState";
import { MatchFilters, type MatchFilter } from "@/components/matches/MatchFilters";
import { getCompetitionSortPriority } from "@/data/mock/competitions";
import { formatCompactVisibleDate, formatVisibleDate, type TranslationKey } from "@/lib/i18n";
import { createLocalDateFromKey, filterMatchesByLocalDate, formatDateKey, shiftLocalDateKey } from "@/lib/match-date";

type MatchListProps = {
  matches: Match[];
  dataSource: MatchListDataSource;
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

function formatSelectedDateLabel(dateString: string, language: Parameters<typeof formatVisibleDate>[1]) {
  return formatVisibleDate(createLocalDateFromKey(dateString), language);
}

function formatCompactSelectedDateLabel(dateString: string, language: Parameters<typeof formatCompactVisibleDate>[1]) {
  return formatCompactVisibleDate(createLocalDateFromKey(dateString), language);
}

function filterMatches(matches: Match[], activeFilter: MatchFilter) {
  if (activeFilter === "all") {
    return matches;
  }

  return matches.filter((match) => match.status === activeFilter);
}

function DataSourceIndicator({ source }: { source: MatchListDataSource }) {
  const { t } = usePreferences();
  const label = source === "api-football" ? t("apiFootballData") : t("demoData");

  return (
    <div className="flex justify-end">
      <span
        className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white/55 px-2.5 py-1 text-[0.68rem] font-medium uppercase tracking-[0.16em] text-zinc-500 shadow-sm shadow-zinc-200/40 dark:border-zinc-800 dark:bg-zinc-900/45 dark:text-zinc-500 dark:shadow-black/10"
        aria-label={`${t("dataSource")}: ${label}`}
        title={`${t("dataSource")}: ${label}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/70" aria-hidden="true" />
        <span>{t("dataSource")}</span>
        <span className="text-zinc-300 dark:text-zinc-700" aria-hidden="true">·</span>
        <span className="text-zinc-600 dark:text-zinc-400">{label}</span>
      </span>
    </div>
  );
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

export function MatchList({ matches, dataSource }: MatchListProps) {
  const { language, t } = usePreferences();
  const [activeFilter, setActiveFilter] = useState<MatchFilter>("all");
  const [selectedDate, setSelectedDate] = useState(() => formatDateKey(new Date()));
  const [visibleMatches, setVisibleMatches] = useState(matches);
  const [visibleDataSource, setVisibleDataSource] = useState(dataSource);
  const [isLoading, setIsLoading] = useState(false);
  const [collapsedCompetitions, setCollapsedCompetitions] = useState<Record<string, boolean>>(
    {},
  );

  useEffect(() => {
    let isCurrentRequest = true;

    async function loadMatchesForSelectedDate() {
      setIsLoading(true);

      try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const response = await fetch(`/api/matches?date=${selectedDate}&timezone=${encodeURIComponent(timezone)}`);
        if (!response.ok) throw new Error(`Match request failed: ${response.status}`);
        const result = await response.json() as { matches: Match[]; source: MatchListDataSource };

        if (isCurrentRequest) {
          setVisibleMatches(result.matches);
          setVisibleDataSource(result.source);
        }
      } catch (error) {
        console.error("Unable to load matches for selected date.", error);
        if (isCurrentRequest) {
          setVisibleMatches([]);
          setVisibleDataSource(dataSource);
        }
      } finally {
        if (isCurrentRequest) setIsLoading(false);
      }
    }

    void loadMatchesForSelectedDate();

    return () => {
      isCurrentRequest = false;
    };
  }, [dataSource, selectedDate]);

  const viewerTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  // Re-check each kickoff instant in the browser timezone so cards, sections, and detail links
  // all use the same local-date boundary as the selected day.
  const matchesForSelectedDate = filterMatchesByLocalDate(visibleMatches, selectedDate, viewerTimeZone);
  const filteredMatches = filterMatches(matchesForSelectedDate, activeFilter);
  const groupedMatches = groupMatchesByCompetition(filteredMatches);
  const competitionGroups = Object.entries(groupedMatches)
    .map(([name, competitionMatches]) => ({
      name,
      matches: competitionMatches,
    }))
    .sort((firstCompetition, secondCompetition) => {
      const priorityDifference = getCompetitionSortPriority(firstCompetition.name) - getCompetitionSortPriority(secondCompetition.name);

      if (priorityDifference !== 0) {
        return priorityDifference;
      }

      return firstCompetition.name.localeCompare(secondCompetition.name);
    });
  const todayDate = formatDateKey(new Date());
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
        onSelectPreviousDate={() => setSelectedDate((currentDate) => shiftLocalDateKey(currentDate, -1))}
        onSelectNextDate={() => setSelectedDate((currentDate) => shiftLocalDateKey(currentDate, 1))}
        onSelectToday={() => setSelectedDate(todayDate)}
      />

      <MatchFilters activeFilter={activeFilter} onSelectFilter={setActiveFilter} />

      <DataSourceIndicator source={visibleDataSource} />

      {isLoading ? (
        <p className="text-sm font-medium text-stone-600 dark:text-zinc-400" role="status">{t("loadingMatches")}</p>
      ) : null}

      {filteredMatches.length === 0 ? (
        <EmptyMatchState icon={emptyState.icon} title={t(emptyState.titleKey)} description={t(emptyState.descriptionKey)} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
          <CompetitionSidebar competitions={competitionGroups} dataSource={visibleDataSource} />
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
