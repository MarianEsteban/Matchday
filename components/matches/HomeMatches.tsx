"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MatchList } from "@/components/matches/MatchList";
import { MatchTicker } from "@/components/ticker/MatchTicker";
import { PreferenceControls, Trans } from "@/components/ui/AppPreferences";
import { BrandLockup } from "@/components/ui/BrandLockup";
import { getMatchesForSelectedLocalDate } from "@/lib/match-date";
import type { Match, MatchDataStatusMetadata, MatchListDataSource } from "@/types/match";

type HomeMatchesProps = {
  initialMatches: Match[];
  initialDataSource: MatchListDataSource;
  initialMetadata: MatchDataStatusMetadata;
  initialSelectedDateKey: string;
};

export function HomeMatches({ initialMatches, initialDataSource, initialMetadata, initialSelectedDateKey }: HomeMatchesProps) {
  const [selectedDate, setSelectedDate] = useState(initialSelectedDateKey);
  const [matches, setMatches] = useState(initialMatches);
  const [dataSource, setDataSource] = useState(initialDataSource);
  const [metadata, setMetadata] = useState(initialMetadata);
  const [isLoading, setIsLoading] = useState(false);
  const loadedDatesRef = useRef(new Map([[initialSelectedDateKey, { matches: initialMatches, source: initialDataSource, metadata: initialMetadata }]]));

  useEffect(() => {
    let isCurrentRequest = true;
    const cachedDate = loadedDatesRef.current.get(selectedDate);
    if (cachedDate) {
      setMatches(cachedDate.matches);
      setDataSource(cachedDate.source);
      setMetadata(cachedDate.metadata);
      return;
    }

    async function loadMatchesForSelectedDate() {
      setIsLoading(true);

      try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const response = await fetch(`/api/matches?date=${selectedDate}&timezone=${encodeURIComponent(timezone)}`);
        if (!response.ok) throw new Error(`Match request failed: ${response.status}`);
        const result = await response.json() as { matches: Match[]; source: MatchListDataSource; metadata: MatchDataStatusMetadata };

        if (isCurrentRequest) {
          loadedDatesRef.current.set(selectedDate, result);
          setMatches(result.matches);
          setDataSource(result.source);
          setMetadata(result.metadata);
        }
      } catch (error) {
        console.error("Unable to load matches for selected date.", error);
        if (isCurrentRequest) {
          const fallback = loadedDatesRef.current.get(initialSelectedDateKey);
          setMatches(fallback?.matches ?? []);
          setDataSource(fallback?.source ?? initialDataSource);
          setMetadata(fallback?.metadata ?? initialMetadata);
        }
      } finally {
        if (isCurrentRequest) setIsLoading(false);
      }
    }

    void loadMatchesForSelectedDate();

    return () => {
      isCurrentRequest = false;
    };
  }, [initialDataSource, initialMetadata, initialSelectedDateKey, selectedDate]);

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
      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-5 sm:py-5">
        <header className="mb-4 flex items-center justify-between gap-3 sm:mb-5">
          <BrandLockup />
          <PreferenceControls />
        </header>

        <section>
          <div className="mb-3 flex items-end justify-between gap-3">
            <h2 className="text-xl font-black tracking-tight sm:text-2xl"><Trans k="todaysMatches" /></h2>
          </div>

          <MatchList
            matches={visibleMatches}
            dataSource={dataSource}
            metadata={metadata}
            selectedDate={selectedDate}
            isLoading={isLoading}
            onSelectDate={setSelectedDate}
          />
        </section>
      </div>
    </>
  );
}
