import { createMockMatches, formatMatchDate } from "@/data/mock/matches";
import type { Match } from "@/types/match";

export function getMatchesByDate(date: Date = new Date()): Match[] {
  const requestedDate = formatMatchDate(date);

  return createMockMatches(date).filter((match) => match.date === requestedDate);
}
