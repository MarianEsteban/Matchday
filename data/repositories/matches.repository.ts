import { mockMatches } from "@/data/mock/matches";
import type { Match } from "@/types/match";

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getMatchesByDate(date: Date = new Date()): Match[] {
  const requestedDate = formatLocalDate(date);

  return mockMatches.filter((match) => match.date === requestedDate);
}
