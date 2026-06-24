export type MatchStatisticTeamValues = {
  home: number;
  away: number;
};

export type MatchStatistic = {
  id: string;
  matchId: string;
  label: string;
  unit?: "%";
  values: MatchStatisticTeamValues;
};
