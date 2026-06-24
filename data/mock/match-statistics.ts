import type { MatchStatistic } from "@/types/match-statistic";

const createStats = (matchId: string, possession: [number, number], shots: [number, number]): MatchStatistic[] => [
  { id: `${matchId}-possession`, matchId, label: "Posesión", unit: "%", values: { home: possession[0], away: possession[1] } },
  { id: `${matchId}-shots`, matchId, label: "Remates", values: { home: shots[0], away: shots[1] } },
  { id: `${matchId}-shots-on-target`, matchId, label: "Remates al arco", values: { home: Math.ceil(shots[0] / 2), away: Math.ceil(shots[1] / 2) } },
  { id: `${matchId}-corners`, matchId, label: "Córners", values: { home: 6, away: 3 } },
  { id: `${matchId}-fouls`, matchId, label: "Faltas", values: { home: 10, away: 13 } },
];

const matchStatisticFixtures: Record<string, MatchStatistic[]> = {
  "argentina-algeria": createStats("argentina-algeria", [62, 38], [15, 7]),
  "argentina-austria": createStats("argentina-austria", [55, 45], [9, 8]),
  "jordan-argentina": createStats("jordan-argentina", [36, 64], [5, 14]),
};

function getFixtureKey(matchId: string): string {
  return Object.keys(matchStatisticFixtures).find((fixtureKey) => matchId.startsWith(fixtureKey)) ?? matchId;
}

export function getMatchStatisticsByMatchId(matchId: string): MatchStatistic[] {
  const fixtureKey = getFixtureKey(matchId);

  return (matchStatisticFixtures[fixtureKey] ?? []).map((statistic) => ({
    ...statistic,
    matchId,
    id: statistic.id.replace(fixtureKey, matchId),
  }));
}
