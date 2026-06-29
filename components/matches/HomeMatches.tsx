"use client";

import { useEffect, useMemo, useState } from "react";
import { MatchList } from "@/components/matches/MatchList";
import { MatchTicker } from "@/components/ticker/MatchTicker";
import { PreferenceControls, Trans } from "@/components/ui/AppPreferences";
import { BrandLockup } from "@/components/ui/BrandLockup";
import { getMatchesForSelectedLocalDate } from "@/lib/match-date";
import type { Match, MatchListDataSource } from "@/types/match";

type HomeMatchesProps = {
  initialMatches: Match[];
  initialDataSource: MatchListDataSource;
  initialSelectedDateKey: string;
};

export function HomeMatches({ initialMatches, initialDataSource, initialSelectedDateKey }: HomeMatchesProps) {
  const [selectedDate, setSelectedDate] = useState(initialSelectedDateKey);
  const [matches, setMatches] = useState(initialMatches);
  const [dataSource, setDataSource] = useState(initialDataSource);
  const [isLoading, setIsLoading] = useState(false);

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
          setMatches(result.matches);
          setDataSource(result.source);
        }
      } catch (error) {
        console.error("Unable to load matches for selected date.", error);
        if (isCurrentRequest) {
          setMatches([]);
          setDataSource(initialDataSource);
        }
      } finally {
        if (isCurrentRequest) setIsLoading(false);
      }
    }

    void loadMatchesForSelectedDate();

    return () => {
      isCurrentRequest = false;
    };
  }, [initialDataSource, selectedDate]);

  const visibleMatches = useMemo(() => {
    const viewerTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const browserDateMatches = getMatchesForSelectedLocalDate(matches, selectedDate, viewerTimeZone);
    const serverDateMatches = matches.filter((match) => match.date === selectedDate);

    return browserDateMatches.length > 0 || serverDateMatches.length === 0
      ? browserDateMatches
      : serverDateMatches;
  }, [matches, selectedDate]);

  return (
    <>
      <MatchTicker matches={visibleMatches} />
      <div className="mx-auto max-w-6xl px-4 py-5 sm:p-6">
        <header className="mb-6 flex items-center justify-between gap-3 sm:mb-8 sm:flex-wrap sm:gap-4">
          <BrandLockup />
          <PreferenceControls />
        </header>

        <section className="mb-8">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold"><Trans k="todaysMatches" /></h2>
          </div>

          <MatchList
            matches={visibleMatches}
            dataSource={dataSource}
            selectedDate={selectedDate}
            isLoading={isLoading}
            onSelectDate={setSelectedDate}
          />
        </section>
      </div>
    </>
  );
}
