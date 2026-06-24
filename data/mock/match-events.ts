import type { MatchEvent } from "@/types/match-event";

const matchEventFixtures: Record<string, MatchEvent[]> = {
  "boca-racing": [
    {
      id: "boca-racing-goal-merentiel-18",
      matchId: "boca-racing",
      type: "goal",
      minute: 18,
      team: "home",
      playerName: "Miguel Merentiel",
      assistName: "Kevin Zenón",
    },
    {
      id: "boca-racing-yellow-sosa-34",
      matchId: "boca-racing",
      type: "yellow-card",
      minute: 34,
      team: "away",
      playerName: "Santiago Sosa",
      reason: "Juego brusco",
    },
    {
      id: "boca-racing-goal-martinez-52",
      matchId: "boca-racing",
      type: "goal",
      minute: 52,
      team: "away",
      playerName: "Adrián Martínez",
    },
    {
      id: "boca-racing-substitution-boca-68",
      matchId: "boca-racing",
      type: "substitution",
      minute: 68,
      team: "home",
      playerName: "Exequiel Zeballos",
      playerInName: "Exequiel Zeballos",
      playerOutName: "Edinson Cavani",
    },
    {
      id: "boca-racing-red-rojas-79",
      matchId: "boca-racing",
      type: "red-card",
      minute: 79,
      team: "away",
      playerName: "Gabriel Rojas",
      reason: "Doble amarilla",
    },
  ],
  "river-independiente": [
    {
      id: "river-independiente-goal-borja-22",
      matchId: "river-independiente",
      type: "goal",
      minute: 22,
      team: "home",
      playerName: "Miguel Borja",
      assistName: "Claudio Echeverri",
    },
    {
      id: "river-independiente-yellow-marcone-41",
      matchId: "river-independiente",
      type: "yellow-card",
      minute: 41,
      team: "away",
      playerName: "Iván Marcone",
    },
    {
      id: "river-independiente-substitution-away-61",
      matchId: "river-independiente",
      type: "substitution",
      minute: 61,
      team: "away",
      playerName: "Santiago López",
      playerInName: "Santiago López",
      playerOutName: "Gabriel Ávalos",
    },
    {
      id: "river-independiente-goal-colidio-74",
      matchId: "river-independiente",
      type: "goal",
      minute: 74,
      team: "home",
      playerName: "Facundo Colidio",
    },
  ],
};

function getFixtureKey(matchId: string): string {
  return (
    Object.keys(matchEventFixtures).find((fixtureKey) => matchId.startsWith(fixtureKey)) ??
    matchId
  );
}

export function getMatchEventsByMatchId(matchId: string): MatchEvent[] {
  const fixtureKey = getFixtureKey(matchId);

  return (matchEventFixtures[fixtureKey] ?? []).map((event) => ({
    ...event,
    matchId,
    id: event.id.replace(fixtureKey, matchId),
  }));
}
