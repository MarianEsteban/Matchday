import { createMockMatches, formatMatchDate } from "@/data/mock/matches";
import type { Match } from "@/types/match";

export function getMatchesByDate(date: Date = new Date()): Match[] {
  const requestedDate = formatMatchDate(date);

  return createMockMatches(date).filter((match) => match.date === requestedDate);
}

export function getMatchById(id: string): Match | undefined {
  return createMockMatches().find((match) => match.id === id);
}
