import { formatMatchDate } from "@/data/mock/matches";
import { createMatchDataSource } from "@/data/services/match-data-source";
import type { Match } from "@/types/match";

const matchDataSource = createMatchDataSource();

export async function getMatchesByDate(date: Date = new Date()): Promise<Match[]> {
  const requestedDate = formatMatchDate(date);

  try {
    const matches = await matchDataSource.getMatches({ date });

    return matches.filter((match) => match.date === requestedDate);
  } catch (error) {
    console.error("Unable to load matches from configured data source.", error);

    return [];
  }
}

export async function getMatchById(id: string): Promise<Match | undefined> {
  try {
    return matchDataSource.getMatchById(id);
  } catch (error) {
    console.error("Unable to load match from configured data source.", error);

    return undefined;
  }
}
