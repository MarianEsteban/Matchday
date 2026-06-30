import "server-only";

import { featuredCompetitionPriority, getFeaturedCompetitionReasonForMatch, isFeaturedCompetitionMatch } from "@/data/mock/competitions";
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
  fresh?: boolean;
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
    case "api-empty": return "API-Football empty";
    case "api-error": return "API-Football error";
    case "demo-fallback": return "Demo fallback (explicitly enabled)";
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
  if (quotaLimited) return { apiStatus, quotaLimited: true, fallbackReason: "API-Football quota limited; no demo fallback was applied" };
  if (apiStatus === 401 || apiStatus === 403) return { apiStatus, quotaLimited: false, fallbackReason: "API-Football unauthorized or invalid key; no demo fallback was applied" };
  if (apiStatus) return { apiStatus, quotaLimited: false, fallbackReason: `API-Football returned HTTP ${apiStatus}; no demo fallback was applied` };
  return { quotaLimited: false, fallbackReason: "API-Football request failed; no demo fallback was applied" };
}

function buildSidebarCompetitionCount(matches: Match[]) {
  return new Set(matches.map((match) => match.competition)).size + featuredCompetitionPriority.filter((competition) => !matches.some((match) => match.competition === competition)).length;
}

function buildVisibleFixtureMetadata(matches: Match[]) {
  return matches.map((match) => ({
    id: match.id,
    homeTeam: match.homeTeam.name,
    awayTeam: match.awayTeam.name,
    competition: match.competition,
    apiFootballLeagueId: match.apiFootball?.leagueId,
    apiFootballLeagueName: match.apiFootball?.leagueName,
    apiFootballRound: match.apiFootball?.round,
    standingsContextLabel: match.standingsContext?.label,
    isFeatured: isFeaturedCompetitionMatch(match),
    featuredReason: getFeaturedCompetitionReasonForMatch(match),
  }));
}

function getEmptyApiFallbackReason(details: {
  rawFixtureCount: number;
  normalizedFixtureCount: number;
  localFixtureCount: number;
  featuredFixtureCount: number;
  quotaLimited: boolean;
  apiStatus?: number;
  usedLeagueSpecificFixtures?: boolean;
}) {
  if (details.quotaLimited) return "API quota limited; no demo fallback was applied";
  if (details.apiStatus && details.apiStatus >= 400) return "API request failed; no demo fallback was applied";
  if (details.usedLeagueSpecificFixtures) return "Using league-specific API fixtures";
  if (details.rawFixtureCount === 0) return "API date endpoint returned zero fixtures; featured league-specific queries also returned zero fixtures";
  if (details.normalizedFixtureCount === 0 || details.localFixtureCount === 0) return "API returned fixtures but none matched selected local date; no demo fallback was applied";
  if (details.featuredFixtureCount === 0) return "API returned fixtures but none were featured; no demo fallback was applied";
  return "API returned fixtures but none were visible; no demo fallback was applied";
}

export async function loadMatchesForDate(query: PipelineQuery = {}): Promise<MatchDataPipelineResult> {
  const requestedDataMode = getMatchdayDataMode();
  const selectedDate = formatMatchDate(query.date ?? new Date());
  const timezone = query.timezone ?? "UTC";
  const apiKeyPresent = Boolean(process.env.FOOTBALL_API_KEY);
  const demoMatches = getMatchesForSelectedLocalDate(createMockMatches(query.date), selectedDate, query.timezone);
  const fallbackAllowed = process.env.MATCHDAY_ALLOW_DEMO_FALLBACK === "1" || process.env.MATCHDAY_ALLOW_DEMO_FALLBACK?.toLowerCase() === "true";

  if (requestedDataMode === "demo") {
    return buildResult({ requestedDataMode, selectedDate, timezone, apiKeyPresent, matches: demoMatches, source: "demo", rawFixtureCount: demoMatches.length, apiAttempted: false, demoFixtureCount: demoMatches.length, fallbackAllowed, fallbackReason: "MATCHDAY_DATA_MODE=demo, API-Football was not called" });
  }

  if (!apiKeyPresent) {
    if (fallbackAllowed) {
      return buildResult({ requestedDataMode, selectedDate, timezone, apiKeyPresent, matches: demoMatches, source: "demo-fallback", rawFixtureCount: 0, apiAttempted: false, demoFixtureCount: demoMatches.length, fallbackAllowed, fallbackReason: "API-Football key missing; explicit demo fallback is enabled" });
    }

    return buildResult({ requestedDataMode, selectedDate, timezone, apiKeyPresent, matches: [], source: "api-error", rawFixtureCount: 0, apiAttempted: false, demoFixtureCount: demoMatches.length, fallbackAllowed, fallbackReason: "API-Football key missing; no demo fallback was applied" });
  }

  const api = new FootballApiService();
  try {
    const apiMatches = await api.getFixtures(query);
    const visibleApiMatches = getMatchesForSelectedLocalDate(apiMatches, selectedDate, query.timezone);
    const diagnostics = api.getLastFixturesDiagnostics();
    const fromCache = api.didLastFixturesUseCache();

    if (visibleApiMatches.length > 0) {
      return buildResult({ requestedDataMode, selectedDate, timezone, apiKeyPresent, matches: visibleApiMatches, source: fromCache ? "cached-api-football" : "api-football", rawFixtureCount: diagnostics?.rawFixtureCount ?? apiMatches.length, normalizedFixtureCount: diagnostics?.normalizedFixtureCount, queriedApiDateKeys: diagnostics?.queriedApiDateKeys, apiFixtureSamples: diagnostics?.fixtureSamples, apiAttempted: true, apiStatus: diagnostics?.apiStatus, quotaLimited: diagnostics?.quotaLimited ?? false, fromCache, requestedApiUrls: diagnostics?.requestedApiUrls, responseFresh: diagnostics?.responseFresh, cacheSource: diagnostics?.cacheSource, fallbackReason: diagnostics?.usedLeagueSpecificFixtures ? "Using league-specific API fixtures" : undefined, realApiFixtureCount: diagnostics?.normalizedFixtureCount ?? apiMatches.length, visibleApiFixtureCount: visibleApiMatches.length, demoFixtureCount: demoMatches.length, fallbackAllowed });
    }

    const fallbackReason = getEmptyApiFallbackReason({
      rawFixtureCount: diagnostics?.rawFixtureCount ?? 0,
      normalizedFixtureCount: diagnostics?.normalizedFixtureCount ?? 0,
      localFixtureCount: apiMatches.length,
      featuredFixtureCount: apiMatches.filter(isFeaturedCompetitionMatch).length,
      quotaLimited: diagnostics?.quotaLimited ?? false,
      apiStatus: diagnostics?.apiStatus,
      usedLeagueSpecificFixtures: diagnostics?.usedLeagueSpecificFixtures,
    });
    if (fallbackAllowed) return buildResult({ requestedDataMode, selectedDate, timezone, apiKeyPresent, matches: demoMatches, source: "demo-fallback", rawFixtureCount: diagnostics?.rawFixtureCount ?? 0, normalizedFixtureCount: diagnostics?.normalizedFixtureCount, queriedApiDateKeys: diagnostics?.queriedApiDateKeys, apiFixtureSamples: diagnostics?.fixtureSamples, apiAttempted: true, apiStatus: diagnostics?.apiStatus, quotaLimited: diagnostics?.quotaLimited ?? false, requestedApiUrls: diagnostics?.requestedApiUrls, responseFresh: diagnostics?.responseFresh, cacheSource: diagnostics?.cacheSource, fallbackReason, realApiFixtureCount: diagnostics?.normalizedFixtureCount ?? apiMatches.length, visibleApiFixtureCount: visibleApiMatches.length, demoFixtureCount: demoMatches.length, fallbackAllowed });
    return buildResult({ requestedDataMode, selectedDate, timezone, apiKeyPresent, matches: [], source: "api-empty", rawFixtureCount: diagnostics?.rawFixtureCount ?? 0, normalizedFixtureCount: diagnostics?.normalizedFixtureCount, queriedApiDateKeys: diagnostics?.queriedApiDateKeys, apiFixtureSamples: diagnostics?.fixtureSamples, apiAttempted: true, apiStatus: diagnostics?.apiStatus, quotaLimited: diagnostics?.quotaLimited ?? false, requestedApiUrls: diagnostics?.requestedApiUrls, responseFresh: diagnostics?.responseFresh, cacheSource: diagnostics?.cacheSource, fallbackReason, realApiFixtureCount: diagnostics?.normalizedFixtureCount ?? apiMatches.length, visibleApiFixtureCount: visibleApiMatches.length, demoFixtureCount: demoMatches.length, fallbackAllowed });
  } catch (error) {
    const safeError = classifyApiError(error);
    if (process.env.NODE_ENV !== "production") console.warn("[matchday data pipeline]", { selectedDate, timezone, requestedDataMode, apiKeyPresent, ...safeError });
    if (fallbackAllowed) return buildResult({ requestedDataMode, selectedDate, timezone, apiKeyPresent, matches: demoMatches, source: "demo-fallback", rawFixtureCount: 0, apiAttempted: true, demoFixtureCount: demoMatches.length, fallbackAllowed, ...safeError });
    return buildResult({ requestedDataMode, selectedDate, timezone, apiKeyPresent, matches: [], source: "api-error", rawFixtureCount: 0, apiAttempted: true, demoFixtureCount: demoMatches.length, fallbackAllowed, ...safeError });
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
  normalizedFixtureCount?: number;
  queriedApiDateKeys?: string[];
  apiFixtureSamples?: MatchDataStatusMetadata["apiFixtureSamples"];
  apiQueryDiagnostics?: MatchDataStatusMetadata["apiQueryDiagnostics"];
  apiAttempted: boolean;
  apiStatus?: number;
  quotaLimited?: boolean;
  fromCache?: boolean;
  requestedApiUrls?: string[];
  responseFresh?: boolean;
  cacheSource?: MatchDataStatusMetadata["cacheSource"];
  fallbackReason?: string;
  realApiFixtureCount?: number;
  visibleApiFixtureCount?: number;
  demoFixtureCount?: number;
  fallbackAllowed?: boolean;
}): MatchDataPipelineResult {
  const featuredFixtureCount = input.matches.filter(isFeaturedCompetitionMatch).length;
  const usedFallback = input.source === "demo-fallback" || input.source === "api-unavailable-fallback" || input.source === "quota-limited-fallback" || (input.requestedDataMode === "auto" && input.source === "demo");
  const metadata: MatchDataStatusMetadata = {
    requestedDataMode: input.requestedDataMode,
    resolvedDataSource: input.source,
    sourceLabel: sourceLabel(input.source),
    usedFallback,
    fallbackUsed: usedFallback,
    fallbackReason: input.fallbackReason,
    apiKeyPresent: input.apiKeyPresent,
    apiAttempted: input.apiAttempted,
    apiStatus: input.apiStatus,
    quotaLimited: Boolean(input.quotaLimited),
    fromCache: Boolean(input.fromCache),
    requestedApiUrls: input.requestedApiUrls ?? [],
    responseFresh: Boolean(input.responseFresh),
    cacheSource: input.cacheSource ?? (input.source === "demo" ? "demo-fallback" : input.fromCache ? "internal-server-cache" : "next-cache-or-origin"),
    selectedDate: input.selectedDate,
    timezone: input.timezone,
    rawFixtureCount: input.rawFixtureCount,
    normalizedFixtureCount: input.normalizedFixtureCount ?? input.matches.length,
    featuredFixtureCount,
    finalVisibleCount: input.matches.length,
    sidebarCompetitionCount: buildSidebarCompetitionCount(input.matches),
    queriedApiDateKeys: input.queriedApiDateKeys ?? [],
    apiFixtureSamples: input.apiFixtureSamples,
    apiQueryDiagnostics: input.apiQueryDiagnostics,
    visibleFixtures: buildVisibleFixtureMetadata(input.matches),
    displayedFixtureSource: input.source,
    displayedFixtureCount: input.matches.length,
    realApiFixtureCount: input.realApiFixtureCount ?? (input.source === "api-football" || input.source === "cached-api-football" ? input.matches.length : 0),
    visibleApiFixtureCount: input.visibleApiFixtureCount ?? (input.source === "api-football" || input.source === "cached-api-football" ? input.matches.length : 0),
    demoFixtureCount: input.demoFixtureCount ?? (input.source === "demo" || input.source === "demo-fallback" ? input.matches.length : 0),
    fallbackAllowed: Boolean(input.fallbackAllowed),
  };
  return { matches: input.matches, source: input.source, metadata };
}
