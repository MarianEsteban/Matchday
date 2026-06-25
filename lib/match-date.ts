import type { Match } from "@/types/match";

export const DEFAULT_MATCH_TIME_ZONE = "UTC";

function getDateTimeFormatParts(date: Date, timeZone?: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
}

/**
 * Formats a Date as YYYY-MM-DD in the requested time zone.
 * API-Football stores fixture datetimes as instants; filtering must compare the
 * fixture instant against the viewer-selected calendar day, not against the raw
 * UTC date returned by the API.
 */
export function formatDateKey(date: Date, timeZone?: string): string {
  const parts = getDateTimeFormatParts(date, timeZone).reduce<Record<string, string>>((acc, part) => {
    if (part.type !== "literal") acc[part.type] = part.value;
    return acc;
  }, {});

  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function createLocalDateFromKey(dateKey: string): Date {
  return new Date(`${dateKey}T00:00:00`);
}

export function shiftLocalDateKey(dateKey: string, daysToShift: number): string {
  const date = createLocalDateFromKey(dateKey);
  date.setDate(date.getDate() + daysToShift);
  return formatDateKey(date);
}

export function getMatchKickoffDate(match: Match): Date {
  return match.kickoffAt ? new Date(match.kickoffAt) : new Date(`${match.date}T${match.kickoffTime}:00`);
}

export function getMatchLocalDateKey(match: Match, timeZone?: string): string | undefined {
  const kickoffDate = getMatchKickoffDate(match);
  if (Number.isNaN(kickoffDate.getTime())) return undefined;
  return formatDateKey(kickoffDate, timeZone);
}

export function filterMatchesByLocalDate(matches: Match[], selectedDateKey: string, timeZone?: string): Match[] {
  return matches.filter((match) => getMatchLocalDateKey(match, timeZone) === selectedDateKey);
}
