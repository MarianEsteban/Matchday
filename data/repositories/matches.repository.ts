import { createMockMatches, formatMatchDate } from "@/data/mock/matches";
import { createMatchDataSource } from "@/data/services/match-data-source";
import type { Match } from "@/types/match";

const matchDataSource = createMatchDataSource();

export async function getMatchesByDate(date: Date = new Date()): Promise<Match[]> {
  const requestedDate = formatMatchDate(date);
  const demoMatches = createMockMatches(date).filter((match) => match.date === requestedDate);

  try {
    const matches = await matchDataSource.getMatches({ date });
    const usableMatches = matches.filter((match) => match.date === requestedDate);

    return usableMatches.length > 0 ? usableMatches : demoMatches;
  } catch (error) {
    console.error("Unable to load matches from configured data source. Falling back to demo data.", error);

    return demoMatches;
  }
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
