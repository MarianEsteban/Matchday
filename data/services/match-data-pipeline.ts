import "server-only";

import { featuredCompetitionPriority, isFeaturedCompetitionMatch } from "@/data/mock/competitions";
import { createMockMatches, formatMatchDate } from "@/data/mock/matches";
import { getMatchesForSelectedLocalDate } from "@/lib/match-date";
import { getMatchdayDataMode, type MatchdayDataMode } from "@/data/services/data-mode";
import { FootballApiService, isApiFootballQuotaError, isApiFootballQuotaExhausted } from "@/data/services/football-api.service";
import type { Match, MatchListDataSource, MatchDataStatusMetadata } from "@/types/match";

export type MatchDataPipelineResult = {
  matches: Match[];
  source: MatchListDataSource;
  metadata: MatchDataStatusMetadata;
};

type PipelineQuery = {
  date?: Date;
  timezone?: string;
};

type SafeApiError = {
  apiStatus?: number;
  quotaLimited: boolean;
  fallbackReason: string;
};

function sourceLabel(source: MatchListDataSource) {
  switch (source) {
    case "api-football": return "API-Football";
    case "cached-api-football": return "Cached API-Football";
    case "quota-limited-fallback": return "Demo fallback (API-Football quota limited)";
    case "api-unavailable-fallback": return "Demo fallback (API-Football unavailable)";
    default: return "Demo data";
  }
}

function getApiStatus(error: unknown): number | undefined {
  return typeof error === "object" && error !== null && "status" in error && typeof error.status === "number" ? error.status : undefined;
}

function classifyApiError(error: unknown): SafeApiError {
  const apiStatus = getApiStatus(error);
  const quotaLimited = isApiFootballQuotaError(error) || isApiFootballQuotaExhausted() || apiStatus === 429;
  if (quotaLimited) return { apiStatus, quotaLimited: true, fallbackReason: "API-Football quota limited, showing cached/demo fallback" };
  if (apiStatus === 401 || apiStatus === 403) return { apiStatus, quotaLimited: false, fallbackReason: "API-Football unauthorized or invalid key, showing demo fallback" };
  if (apiStatus) return { apiStatus, quotaLimited: false, fallbackReason: `API-Football returned HTTP ${apiStatus}, showing demo fallback` };
  return { quotaLimited: false, fallbackReason: "API-Football request failed, showing demo fallback" };
}

function buildSidebarCompetitionCount(matches: Match[]) {
  return new Set(matches.map((match) => match.competition)).size + featuredCompetitionPriority.filter((competition) => !matches.some((match) => match.competition === competition)).length;
}

export async function loadMatchesForDate(query: PipelineQuery = {}): Promise<MatchDataPipelineResult> {
  const requestedDataMode = getMatchdayDataMode();
  const selectedDate = formatMatchDate(query.date ?? new Date());
  const timezone = query.timezone ?? "UTC";
  const apiKeyPresent = Boolean(process.env.FOOTBALL_API_KEY);
  const demoMatches = getMatchesForSelectedLocalDate(createMockMatches(query.date), selectedDate, query.timezone);

  if (requestedDataMode === "demo") {
    return buildResult({ requestedDataMode, selectedDate, timezone, apiKeyPresent, matches: demoMatches, source: "demo", rawFixtureCount: demoMatches.length, apiAttempted: false, fallbackReason: "MATCHDAY_DATA_MODE=demo, API-Football was not called" });
  }

  if (!apiKeyPresent) {
    const source: MatchListDataSource = requestedDataMode === "api" ? "api-unavailable-fallback" : "demo";
    return buildResult({ requestedDataMode, selectedDate, timezone, apiKeyPresent, matches: demoMatches, source, rawFixtureCount: demoMatches.length, apiAttempted: false, fallbackReason: "API-Football key missing, showing demo fallback" });
  }

  const api = new FootballApiService();
  try {
    const apiMatches = await api.getFixtures(query);
    const visibleApiMatches = getMatchesForSelectedLocalDate(apiMatches, selectedDate, query.timezone);
    const diagnostics = api.getLastFixturesDiagnostics();
    const fromCache = api.didLastFixturesUseCache();

    if (visibleApiMatches.length > 0) {
      return buildResult({ requestedDataMode, selectedDate, timezone, apiKeyPresent, matches: visibleApiMatches, source: fromCache ? "cached-api-football" : "api-football", rawFixtureCount: diagnostics?.rawFixtureCount ?? apiMatches.length, apiAttempted: true, apiStatus: diagnostics?.apiStatus, quotaLimited: diagnostics?.quotaLimited ?? false, fromCache });
    }

    const fallbackReason = "API-Football returned no visible matches for the selected date, showing demo fallback";
    return buildResult({ requestedDataMode, selectedDate, timezone, apiKeyPresent, matches: demoMatches, source: "api-unavailable-fallback", rawFixtureCount: diagnostics?.rawFixtureCount ?? 0, apiAttempted: true, apiStatus: diagnostics?.apiStatus, quotaLimited: diagnostics?.quotaLimited ?? false, fallbackReason });
  } catch (error) {
    const safeError = classifyApiError(error);
    if (process.env.NODE_ENV !== "production") console.warn("[matchday data pipeline]", { selectedDate, timezone, requestedDataMode, apiKeyPresent, ...safeError });
    return buildResult({ requestedDataMode, selectedDate, timezone, apiKeyPresent, matches: demoMatches, source: safeError.quotaLimited ? "quota-limited-fallback" : "api-unavailable-fallback", rawFixtureCount: 0, apiAttempted: true, ...safeError });
  }
}

function buildResult(input: {
  requestedDataMode: MatchdayDataMode;
  selectedDate: string;
  timezone: string;
  apiKeyPresent: boolean;
  matches: Match[];
  source: MatchListDataSource;
  rawFixtureCount: number;
  apiAttempted: boolean;
  apiStatus?: number;
  quotaLimited?: boolean;
  fromCache?: boolean;
  fallbackReason?: string;
}): MatchDataPipelineResult {
  const featuredFixtureCount = input.matches.filter(isFeaturedCompetitionMatch).length;
  const usedFallback = input.source === "api-unavailable-fallback" || input.source === "quota-limited-fallback" || (input.requestedDataMode === "auto" && input.source === "demo");
  const metadata: MatchDataStatusMetadata = {
    requestedDataMode: input.requestedDataMode,
    resolvedDataSource: input.source,
    sourceLabel: sourceLabel(input.source),
    usedFallback,
    fallbackReason: input.fallbackReason,
    apiKeyPresent: input.apiKeyPresent,
    apiAttempted: input.apiAttempted,
    apiStatus: input.apiStatus,
    quotaLimited: Boolean(input.quotaLimited),
    fromCache: Boolean(input.fromCache),
    selectedDate: input.selectedDate,
    timezone: input.timezone,
    rawFixtureCount: input.rawFixtureCount,
    normalizedFixtureCount: input.matches.length,
    featuredFixtureCount,
    finalVisibleCount: input.matches.length,
    sidebarCompetitionCount: buildSidebarCompetitionCount(input.matches),
  };
  return { matches: input.matches, source: input.source, metadata };
}
