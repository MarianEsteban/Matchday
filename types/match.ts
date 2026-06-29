export type MatchStatus = "scheduled" | "live" | "finished";

export type MatchListDataSource = "api-football" | "demo";

export type Team = {
  id: string;
  name: string;
  crestUrl: string;
  countryCode: string;
  apiFootballId?: number;
};

export type Match = {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  competition: string;
  kickoffTime: string;
  kickoffAt?: string;
  venue: string;
  date: string;
  status: MatchStatus;
  score?: {
    home: number;
    away: number;
  };
  apiFootball?: {
    fixtureId: number;
    leagueId?: number;
    leagueName?: string;
    leagueCountry?: string;
    season?: number;
    round?: string;
  };
  standingsContext?: {
    label: string;
    homePosition: number;
    awayPosition: number;
  };
};

export type MatchDetails = {
  match: Match;
  events: import("@/types/match-event").MatchEvent[];
  statistics: import("@/types/match-statistic").MatchStatistic[];
  lineup?: import("@/types/lineup").MatchLineup;
  standings?: import("@/types/standing").CompetitionStandings;
  source: MatchListDataSource;
};
