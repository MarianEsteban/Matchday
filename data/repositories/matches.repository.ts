import { createMockMatches, formatMatchDate } from "@/data/mock/matches";
import { getMatchesForSelectedLocalDate } from "@/lib/match-date";
import { createMatchDataSource } from "@/data/services/match-data-source";
import { getMatchdayDataMode } from "@/data/services/data-mode";
import { isApiFootballQuotaError, isApiFootballQuotaExhausted } from "@/data/services/football-api.service";
import type { Match, MatchDetails, MatchListDataSource } from "@/types/match";
import { getLineupsByMatchId } from "@/data/mock/lineups";
import { getMatchEventsByMatchId } from "@/data/mock/match-events";
import { getMatchStatisticsByMatchId } from "@/data/mock/match-statistics";
import { getStandingsByCompetition } from "@/data/mock/standings";

const matchDataSource = createMatchDataSource();

export type MatchesByDateResult = {
  matches: Match[];
  source: MatchListDataSource;
};

export async function getMatchesByDateWithSource(date: Date = new Date(), timezone?: string): Promise<MatchesByDateResult> {
  const requestedDate = formatMatchDate(date);
  const demoMatches = createMockMatches(date).filter((match) => match.date === requestedDate);

  try {
    const matches = await matchDataSource.getMatches({ date, timezone });
    // API-Football can return timezone-shifted fixture instants for the requested API date.
    // Prefer strict local-day matches, but keep same-date curated API fixtures when strict
    // filtering would otherwise hide the entire curated response.
    const usableMatches = getMatchesForSelectedLocalDate(matches, requestedDate, timezone);

    if (matchDataSource.source === "api-football") {
      const source = matchDataSource.didLastFixturesUseCache?.() ? "cached-api-football" : matchDataSource.source;
      if (usableMatches.length > 0) {
        logRepositoryDiagnostics({ requestedDate, timezone, source, visibleMatches: usableMatches.length });
        return { matches: usableMatches, source };
      }

      logRepositoryDiagnostics({ requestedDate, timezone, source: "api-unavailable-fallback", visibleMatches: demoMatches.length, note: "API-Football returned no visible matches for the selected date; using demo fallback." });
      return { matches: demoMatches, source: "api-unavailable-fallback" };
    }

    logRepositoryDiagnostics({ requestedDate, timezone, source: "demo", visibleMatches: demoMatches.length });
    return { matches: demoMatches, source: "demo" };
  } catch (error) {
    const mode = getMatchdayDataMode();
    const message = isApiFootballQuotaError(error)
      ? "API-Football quota/rate limit reached. Falling back without retrying aggressively."
      : "Unable to load matches from configured data source. Falling back to demo data.";
    if (process.env.NODE_ENV !== "production") {
      console.warn(message, {
        dataMode: mode,
        hasApiKey: Boolean(process.env.FOOTBALL_API_KEY),
        selectedDate: requestedDate,
        timezone: timezone ?? "UTC",
        quotaLimited: isApiFootballQuotaExhausted(),
        fallbackSource: matchDataSource.source === "api-football" ? "error-fallback" : "demo",
      });
    }

    return { matches: demoMatches, source: matchDataSource.source === "api-football" ? (isApiFootballQuotaError(error) ? "quota-limited-fallback" : "api-unavailable-fallback") : "demo" };
  }
}

export async function getMatchesByDate(date: Date = new Date()): Promise<Match[]> {
  const { matches } = await getMatchesByDateWithSource(date);

  return matches;
}

export async function getMatchById(id: string): Promise<Match | undefined> {
  const demoMatch = createMockMatches().find((match) => match.id === id);

  try {
    const match = await matchDataSource.getMatchById(id);

    return match ?? demoMatch;
  } catch (error) {
    console.error("Unable to load match from configured data source. Falling back to demo data.", error);

    return demoMatch;
  }
}


export async function getMatchDetailsById(id: string): Promise<MatchDetails | undefined> {
  const demoMatch = createMockMatches().find((match) => match.id === id);

  try {
    const details = await matchDataSource.getMatchDetailsById?.(id);
    if (details) return details;
  } catch (error) {
    console.error("Unable to load match details from configured data source. Falling back to demo data.", error);
  }

  if (!demoMatch) return undefined;
  return {
    match: demoMatch,
    events: getMatchEventsByMatchId(demoMatch.id),
    statistics: getMatchStatisticsByMatchId(demoMatch.id),
    lineup: getLineupsByMatchId(demoMatch.id),
    standings: getStandingsByCompetition(demoMatch.competition),
    source: "demo",
  };
}

function logRepositoryDiagnostics(details: { requestedDate: string; timezone?: string; source: MatchListDataSource; visibleMatches: number; note?: string }) {
  if (process.env.NODE_ENV === "production") return;
  console.info("[matchday fallback diagnostics]", {
    selectedDate: details.requestedDate,
    timezone: details.timezone ?? "UTC",
    finalVisibleMatches: details.visibleMatches,
    fallbackSourceUsed: details.source === "api-football" ? "api" : details.source === "cached-api-football" ? "cached-api" : details.source === "demo" ? "demo" : details.source === "quota-limited-fallback" ? "quota-limited-demo" : "error-fallback",
    quotaLimited: isApiFootballQuotaExhausted(),
    note: details.note,
  });
}
