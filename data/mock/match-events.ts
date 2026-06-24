import type { MatchEvent } from "@/types/match-event";

const matchEventFixtures: Record<string, MatchEvent[]> = {
  "argentina-algeria": [
    { id: "argentina-algeria-goal-alvarez-19", matchId: "argentina-algeria", type: "goal", minute: 19, team: "home", playerName: "Julián Álvarez", assistName: "Lionel Messi" },
    { id: "argentina-algeria-yellow-bennacer-37", matchId: "argentina-algeria", type: "yellow-card", minute: 37, team: "away", playerName: "Ismaël Bennacer", reason: "Juego brusco" },
    { id: "argentina-algeria-substitution-argentina-64", matchId: "argentina-algeria", type: "substitution", minute: 64, team: "home", playerName: "Lautaro Martínez", playerInName: "Lautaro Martínez", playerOutName: "Julián Álvarez" },
    { id: "argentina-algeria-goal-messi-78", matchId: "argentina-algeria", type: "goal", minute: 78, team: "home", playerName: "Lionel Messi" },
  ],
  "argentina-austria": [
    { id: "argentina-austria-goal-laimer-12", matchId: "argentina-austria", type: "goal", minute: 12, team: "away", playerName: "Konrad Laimer" },
    { id: "argentina-austria-goal-mac-allister-44", matchId: "argentina-austria", type: "goal", minute: 44, team: "home", playerName: "Alexis Mac Allister", assistName: "Ángel Di María" },
    { id: "argentina-austria-yellow-de-paul-58", matchId: "argentina-austria", type: "yellow-card", minute: 58, team: "home", playerName: "Rodrigo De Paul" },
  ],
};

function getFixtureKey(matchId: string): string {
  return Object.keys(matchEventFixtures).find((fixtureKey) => matchId.startsWith(fixtureKey)) ?? matchId;
}

export function getMatchEventsByMatchId(matchId: string): MatchEvent[] {
  const fixtureKey = getFixtureKey(matchId);

  return (matchEventFixtures[fixtureKey] ?? []).map((event) => ({
    ...event,
    matchId,
    id: event.id.replace(fixtureKey, matchId),
  }));
}
