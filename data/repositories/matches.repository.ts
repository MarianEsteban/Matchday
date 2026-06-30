import { createMockMatches } from "@/data/mock/matches";
import { createMatchDataSource } from "@/data/services/match-data-source";
import type { Match, MatchDetails } from "@/types/match";
import { getLineupsByMatchId } from "@/data/mock/lineups";
import { getMatchEventsByMatchId } from "@/data/mock/match-events";
import { getMatchStatisticsByMatchId } from "@/data/mock/match-statistics";
import { getStandingsByCompetition } from "@/data/mock/standings";

const matchDataSource = createMatchDataSource();

export type MatchesByDateResult = import("@/data/services/match-data-pipeline").MatchDataPipelineResult;

export async function getMatchesByDateWithSource(date: Date = new Date(), timezone?: string): Promise<MatchesByDateResult> {
  const { loadMatchesForDate } = await import("@/data/services/match-data-pipeline");
  return loadMatchesForDate({ date, timezone });
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
