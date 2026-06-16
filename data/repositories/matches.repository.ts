import { mockMatches } from "@/data/mock/matches";
import type { Match } from "@/types/match";

export function getMatchesByDate(date: Date = new Date()): Match[] {
  const requestedDate = date.toISOString().slice(0, 10);

  return mockMatches.filter((match) => match.date === requestedDate);
}
