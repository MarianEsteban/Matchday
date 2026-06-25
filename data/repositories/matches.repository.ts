import { createMockMatches, formatMatchDate } from "@/data/mock/matches";
import { createMatchDataSource } from "@/data/services/match-data-source";
import type { Match, MatchListDataSource } from "@/types/match";

const matchDataSource = createMatchDataSource();

export type MatchesByDateResult = {
  matches: Match[];
  source: MatchListDataSource;
};

export async function getMatchesByDateWithSource(date: Date = new Date()): Promise<MatchesByDateResult> {
  const requestedDate = formatMatchDate(date);
  const demoMatches = createMockMatches(date).filter((match) => match.date === requestedDate);

  try {
    const matches = await matchDataSource.getMatches({ date });
    const usableMatches = matches.filter((match) => match.date === requestedDate);

    return usableMatches.length > 0
      ? { matches: usableMatches, source: matchDataSource.source }
      : { matches: demoMatches, source: "demo" };
  } catch (error) {
    console.error("Unable to load matches from configured data source. Falling back to demo data.", error);

    return { matches: demoMatches, source: "demo" };
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
