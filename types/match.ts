export type MatchStatus = "scheduled" | "live" | "finished";

export type MatchListDataSource = "api-football" | "demo";

export type Team = {
  id: string;
  name: string;
  crestUrl: string;
  countryCode: string;
};

export type Match = {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  competition: string;
  kickoffTime: string;
  venue: string;
  date: string;
  status: MatchStatus;
  score?: {
    home: number;
    away: number;
  };
};
