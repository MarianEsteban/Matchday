export type StandingRow = {
  position: number;
  teamId: string;
  teamName: string;
  apiFootballTeamId?: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
};

export type CompetitionStandings = {
  competition: string;
  rows: StandingRow[];
};
