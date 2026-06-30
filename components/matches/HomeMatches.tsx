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

  function isRealApiSource(source: MatchListDataSource) {
    return source === "api-football" || source === "cached-api-football";
  }

  function isDemoLikeSource(source: MatchListDataSource) {
    return source === "demo" || source === "demo-fallback" || source === "api-unavailable-fallback" || source === "quota-limited-fallback";
  }

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
          const currentDateData = loadedDatesRef.current.get(selectedDate);
          const shouldPreserveRealInitialData = Boolean(
            currentDateData &&
            isRealApiSource(currentDateData.source) &&
            isDemoLikeSource(result.source) &&
            result.metadata.requestedDataMode !== "demo",
          );

          if (shouldPreserveRealInitialData && currentDateData) {
            const preservedMetadata = {
              ...currentDateData.metadata,
              fallbackReason: result.metadata.fallbackReason ?? "Client refresh returned demo/fallback data; keeping already-rendered API-Football matches.",
              clientReplacedInitialData: false,
              clientPreservedInitialData: true,
            };
            loadedDatesRef.current.set(selectedDate, { ...currentDateData, metadata: preservedMetadata });
            setMatches(currentDateData.matches);
            setDataSource(currentDateData.source);
            setMetadata(preservedMetadata);
            return;
          }

          const nextResult = {
            ...result,
            metadata: {
              ...result.metadata,
              clientReplacedInitialData: true,
              clientPreservedInitialData: false,
            },
          };
          loadedDatesRef.current.set(selectedDate, nextResult);
          setMatches(nextResult.matches);
          setDataSource(nextResult.source);
          setMetadata(nextResult.metadata);
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

    if (browserDateMatches.length > 0) return browserDateMatches;
    if (serverDateMatches.length > 0) return serverDateMatches;
    if (metadata.selectedDate === selectedDate) return matches;
    return [];
  }, [matches, metadata.selectedDate, selectedDate]);

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
