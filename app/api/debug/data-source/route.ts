import { NextRequest, NextResponse } from "next/server";
import { getMatchesByDateWithSource } from "@/data/repositories/matches.repository";

function parseDateParam(value: string | null): Date | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  return new Date(`${value}T00:00:00`);
}

export async function GET(request: NextRequest) {
  const date = parseDateParam(request.nextUrl.searchParams.get("date"));
  const timezone = request.nextUrl.searchParams.get("timezone") ?? undefined;
  const { metadata } = await getMatchesByDateWithSource(date, timezone);

  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({
      requestedDataMode: metadata.requestedDataMode,
      resolvedDataSource: metadata.resolvedDataSource,
      sourceLabel: metadata.sourceLabel,
      usedFallback: metadata.usedFallback,
      fallbackReason: metadata.fallbackReason,
      selectedDate: metadata.selectedDate,
    });
  }

  return NextResponse.json({
    activeDataMode: metadata.requestedDataMode,
    apiKeyPresent: metadata.apiKeyPresent,
    selectedDate: metadata.selectedDate,
    timezone: metadata.timezone,
    apiFootballAttempted: metadata.apiAttempted,
    apiResponseStatus: metadata.apiStatus,
    quotaLimited: metadata.quotaLimited,
    fromCache: metadata.fromCache,
    rawFixtureCount: metadata.rawFixtureCount,
    normalizedFixtureCount: metadata.normalizedFixtureCount,
    featuredMatchCount: metadata.featuredFixtureCount,
    finalVisibleCount: metadata.finalVisibleCount,
    sidebarCompetitionCount: metadata.sidebarCompetitionCount,
    fallbackReason: metadata.fallbackReason,
    resolvedDataSource: metadata.resolvedDataSource,
    sourceLabel: metadata.sourceLabel,
  });
}
