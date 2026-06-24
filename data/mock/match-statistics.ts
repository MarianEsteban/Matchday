import type { MatchStatistic } from "@/types/match-statistic";

const matchStatisticFixtures: Record<string, MatchStatistic[]> = {
  "boca-racing": [
    {
      id: "boca-racing-possession",
      matchId: "boca-racing",
      label: "Posesión",
      unit: "%",
      values: { home: 54, away: 46 },
    },
    {
      id: "boca-racing-shots",
      matchId: "boca-racing",
      label: "Remates",
      values: { home: 13, away: 10 },
    },
    {
      id: "boca-racing-shots-on-target",
      matchId: "boca-racing",
      label: "Remates al arco",
      values: { home: 5, away: 4 },
    },
    {
      id: "boca-racing-corners",
      matchId: "boca-racing",
      label: "Córners",
      values: { home: 6, away: 3 },
    },
    {
      id: "boca-racing-fouls",
      matchId: "boca-racing",
      label: "Faltas",
      values: { home: 11, away: 14 },
    },
  ],
  "river-independiente": [
    {
      id: "river-independiente-possession",
      matchId: "river-independiente",
      label: "Posesión",
      unit: "%",
      values: { home: 61, away: 39 },
    },
    {
      id: "river-independiente-shots",
      matchId: "river-independiente",
      label: "Remates",
      values: { home: 16, away: 7 },
    },
    {
      id: "river-independiente-shots-on-target",
      matchId: "river-independiente",
      label: "Remates al arco",
      values: { home: 7, away: 2 },
    },
    {
      id: "river-independiente-corners",
      matchId: "river-independiente",
      label: "Córners",
      values: { home: 8, away: 2 },
    },
    {
      id: "river-independiente-fouls",
      matchId: "river-independiente",
      label: "Faltas",
      values: { home: 9, away: 13 },
    },
  ],
};

function getFixtureKey(matchId: string): string {
  return (
    Object.keys(matchStatisticFixtures).find((fixtureKey) => matchId.startsWith(fixtureKey)) ??
    matchId
  );
}

export function getMatchStatisticsByMatchId(matchId: string): MatchStatistic[] {
  const fixtureKey = getFixtureKey(matchId);

  return (matchStatisticFixtures[fixtureKey] ?? []).map((statistic) => ({
    ...statistic,
    matchId,
    id: statistic.id.replace(fixtureKey, matchId),
  }));
}
