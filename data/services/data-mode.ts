import "server-only";

export type MatchdayDataMode = "api" | "demo" | "auto";

export function getMatchdayDataMode(): MatchdayDataMode {
  const mode = process.env.MATCHDAY_DATA_MODE?.trim().toLowerCase();
  if (mode === "api" || mode === "demo" || mode === "auto") return mode;
  return "auto";
}

export function canUseApiFootball() {
  const mode = getMatchdayDataMode();
  return mode !== "demo" && Boolean(process.env.FOOTBALL_API_KEY);
}
