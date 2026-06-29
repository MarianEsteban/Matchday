import { createMockMatches, formatMatchDate } from "@/data/mock/matches";
import { getMatchesForSelectedLocalDate } from "@/lib/match-date";
import { createMatchDataSource } from "@/data/services/match-data-source";
import { getMatchdayDataMode } from "@/data/services/data-mode";
import { isApiFootballQuotaError } from "@/data/services/football-api.service";
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
      return { matches: usableMatches, source: matchDataSource.didLastFixturesUseCache?.() ? "cached-api-football" : matchDataSource.source };
    }

    return { matches: demoMatches, source: "demo" };
  } catch (error) {
    const mode = getMatchdayDataMode();
    const message = isApiFootballQuotaError(error)
      ? "API-Football quota/rate limit reached. Falling back without retrying aggressively."
      : "Unable to load matches from configured data source. Falling back to demo data.";
    console.warn(message, { dataMode: mode, hasApiKey: Boolean(process.env.FOOTBALL_API_KEY) });

    return { matches: demoMatches, source: matchDataSource.source === "api-football" ? "api-unavailable-fallback" : "demo" };
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
