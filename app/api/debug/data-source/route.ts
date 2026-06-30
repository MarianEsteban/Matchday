import { NextRequest, NextResponse } from "next/server";
import { getMatchesByDateWithSource } from "@/data/repositories/matches.repository";
import { FootballApiService } from "@/data/services/football-api.service";
import { getMatchdayDataMode } from "@/data/services/data-mode";

function parseDateParam(value: string | null): Date | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  return new Date(`${value}T00:00:00`);
}

export async function GET(request: NextRequest) {
  const date = parseDateParam(request.nextUrl.searchParams.get("date"));
  const timezone = request.nextUrl.searchParams.get("timezone") ?? undefined;
  const { matches, metadata } = await getMatchesByDateWithSource(date, timezone);
  const apiQueryDiagnostics = getMatchdayDataMode() === "demo" || !process.env.FOOTBALL_API_KEY ? [] : await new FootballApiService().getFixtureQueryDiagnostics({ date, timezone });

  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({
      requestedDataMode: metadata.requestedDataMode,
      resolvedDataSource: metadata.resolvedDataSource,
      apiKeyPresent: metadata.apiKeyPresent,
      apiAttempted: metadata.apiAttempted,
      apiStatus: metadata.apiStatus,
      quotaLimited: metadata.quotaLimited,
      selectedDate: metadata.selectedDate,
      timezone: metadata.timezone,
      queriedApiDateKeys: metadata.queriedApiDateKeys,
      rawFixtureCount: metadata.rawFixtureCount,
      normalizedFixtureCount: metadata.normalizedFixtureCount,
      featuredFixtureCount: metadata.featuredFixtureCount,
      sidebarCompetitionCount: metadata.sidebarCompetitionCount,
      finalVisibleCount: metadata.finalVisibleCount,
      fallbackUsed: metadata.fallbackUsed,
      fallbackReason: metadata.fallbackReason,
      sourceLabel: metadata.sourceLabel,
      apiQueryDiagnostics,
    });
  }

  return NextResponse.json({
    requestedDataMode: metadata.requestedDataMode,
    resolvedDataSource: metadata.resolvedDataSource,
    apiKeyPresent: metadata.apiKeyPresent,
    apiAttempted: metadata.apiAttempted,
    apiStatus: metadata.apiStatus,
    quotaLimited: metadata.quotaLimited,
    selectedDate: metadata.selectedDate,
    timezone: metadata.timezone,
    queriedApiDateKeys: metadata.queriedApiDateKeys,
    fromCache: metadata.fromCache,
    rawFixtureCount: metadata.rawFixtureCount,
    normalizedFixtureCount: metadata.normalizedFixtureCount,
    featuredFixtureCount: metadata.featuredFixtureCount,
    sidebarCompetitionCount: metadata.sidebarCompetitionCount,
    finalVisibleCount: metadata.finalVisibleCount,
    fallbackUsed: metadata.fallbackUsed,
    fallbackReason: metadata.fallbackReason,
    sourceLabel: metadata.sourceLabel,
    apiFixtureSamples: metadata.apiFixtureSamples,
    apiQueryDiagnostics,
    visibleFixtures: metadata.visibleFixtures,
    visibleMatches: matches.map((match) => ({
      id: match.id,
      homeTeam: match.homeTeam.name,
      awayTeam: match.awayTeam.name,
      competition: match.competition,
      stage: match.stage,
      group: match.group,
      apiFootball: {
        leagueId: match.apiFootball?.leagueId,
        leagueName: match.apiFootball?.leagueName,
        round: match.apiFootball?.round,
      },
      standingsContextLabel: match.standingsContext?.label,
    })),
  });
}
