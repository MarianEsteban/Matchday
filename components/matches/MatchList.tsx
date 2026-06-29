"use client";

import { useState } from "react";
import { usePreferences } from "@/components/ui/AppPreferences";
import type { Match, MatchListDataSource } from "@/types/match";
import { CompetitionSection } from "@/components/matches/CompetitionSection";
import { CompetitionSidebar } from "@/components/matches/CompetitionSidebar";
import { DateSelector } from "@/components/matches/DateSelector";
import { EmptyMatchState } from "@/components/matches/EmptyMatchState";
import { MatchFilters, type MatchFilter } from "@/components/matches/MatchFilters";
import { featuredCompetitionPriority, getCompetitionSortPriority, isFeaturedCompetitionMatch } from "@/data/mock/competitions";
import { type TranslationKey } from "@/lib/i18n";

type MatchListProps = {
  matches: Match[];
  dataSource: MatchListDataSource;
  selectedDate: string;
  isLoading: boolean;
  onSelectDate: (selectedDate: string) => void;
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

function createAvailableCompetitionGroups(matches: Match[]) {
  const groupedMatches = groupMatchesByCompetition(matches);
  const groupsByName = new Map(Object.entries(groupedMatches).map(([name, competitionMatches]) => [name, {
    name,
    matches: competitionMatches,
    isFeatured: competitionMatches.some(isFeaturedCompetitionMatch),
  }]));

  featuredCompetitionPriority.forEach((competitionName) => {
    if (!groupsByName.has(competitionName)) {
      groupsByName.set(competitionName, { name: competitionName, matches: [], isFeatured: true });
    }
  });

  return [...groupsByName.values()].sort((firstCompetition, secondCompetition) => {
    const firstHasMatches = firstCompetition.matches.length > 0;
    const secondHasMatches = secondCompetition.matches.length > 0;

    if (firstCompetition.isFeatured && secondCompetition.isFeatured) {
      if (firstHasMatches !== secondHasMatches) return firstHasMatches ? -1 : 1;
      return getCompetitionSortPriority(firstCompetition.name) - getCompetitionSortPriority(secondCompetition.name);
    }

    if (firstCompetition.isFeatured !== secondCompetition.isFeatured) {
      if (firstHasMatches && secondHasMatches) return firstCompetition.isFeatured ? -1 : 1;
      if (!firstHasMatches && secondHasMatches) return 1;
      if (firstHasMatches && !secondHasMatches) return -1;
      return firstCompetition.isFeatured ? -1 : 1;
    }

    if (firstHasMatches !== secondHasMatches) return firstHasMatches ? -1 : 1;
    if (firstCompetition.matches.length !== secondCompetition.matches.length) {
      return secondCompetition.matches.length - firstCompetition.matches.length;
    }

    return firstCompetition.name.localeCompare(secondCompetition.name);
  });
}

function filterMatches(matches: Match[], activeFilter: MatchFilter) {
  if (activeFilter === "all") {
    return matches;
  }

  return matches.filter((match) => match.status === activeFilter);
}

function DataSourceIndicator({ source }: { source: MatchListDataSource }) {
  const { t } = usePreferences();
  const label = source === "api-football"
    ? t("apiFootballData")
    : source === "cached-api-football"
      ? t("cachedApiFootballData")
      : source === "api-unavailable-fallback"
        ? t("fallbackData")
        : t("demoData");

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

export function MatchList({ matches, dataSource, selectedDate, isLoading, onSelectDate }: MatchListProps) {
  const { t } = usePreferences();
  const [activeFilter, setActiveFilter] = useState<MatchFilter>("all");
  const [collapsedCompetitions, setCollapsedCompetitions] = useState<Record<string, boolean>>({});
  const [selectedCompetition, setSelectedCompetition] = useState<string | null>(null);

  const allMatchesForDate = matches;
  const featuredMatchesForDate = allMatchesForDate.filter(isFeaturedCompetitionMatch);
  const selectedCompetitionMatches = selectedCompetition
    ? allMatchesForDate.filter((match) => match.competition === selectedCompetition)
    : featuredMatchesForDate;
  const visibleMatches = filterMatches(selectedCompetitionMatches, activeFilter);
  const availableCompetitionsForDate = createAvailableCompetitionGroups(allMatchesForDate);
  const groupedMatches = groupMatchesByCompetition(visibleMatches);
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
  const emptyState = getEmptyState(activeFilter, selectedCompetitionMatches.length > 0);

  function toggleCompetition(competition: string) {
    setCollapsedCompetitions((currentCollapsedCompetitions) => ({
      ...currentCollapsedCompetitions,
      [competition]: !currentCollapsedCompetitions[competition],
    }));
  }

  return (
    <div className="space-y-6">
      <DateSelector selectedDate={selectedDate} onSelectDate={onSelectDate} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <MatchFilters activeFilter={activeFilter} onSelectFilter={setActiveFilter} />
        <DataSourceIndicator source={dataSource} />
      </div>

      {isLoading ? (
        <p className="rounded-2xl border border-stone-200 bg-white/70 px-4 py-3 text-sm font-semibold text-stone-600 dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-400" role="status">{t("loadingMatches")}</p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[17rem_1fr] lg:gap-5">
        <CompetitionSidebar
          competitions={availableCompetitionsForDate}
          selectedCompetition={selectedCompetition}
          onSelectCompetition={setSelectedCompetition}
        />
        {visibleMatches.length === 0 ? (
          <EmptyMatchState icon={emptyState.icon} title={t(emptyState.titleKey)} description={t(emptyState.descriptionKey)} />
        ) : (
          <div className="space-y-4">
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
        )}
      </div>
    </div>
  );
}
