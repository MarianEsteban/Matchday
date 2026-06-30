export type MatchStatus = "scheduled" | "live" | "finished";

export type MatchListDataSource = "api-football" | "cached-api-football" | "demo" | "api-unavailable-fallback" | "quota-limited-fallback";

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

export type MatchDataStatusMetadata = {
  requestedDataMode: "api" | "demo" | "auto";
  resolvedDataSource: MatchListDataSource;
  sourceLabel: string;
  usedFallback: boolean;
  fallbackReason?: string;
  apiKeyPresent: boolean;
  apiAttempted: boolean;
  apiStatus?: number;
  quotaLimited: boolean;
  fromCache: boolean;
  selectedDate: string;
  timezone: string;
  rawFixtureCount: number;
  normalizedFixtureCount: number;
  featuredFixtureCount: number;
  finalVisibleCount: number;
  sidebarCompetitionCount: number;
};

export type MatchDetails = {
  match: Match;
  events: import("@/types/match-event").MatchEvent[];
  statistics: import("@/types/match-statistic").MatchStatistic[];
  lineup?: import("@/types/lineup").MatchLineup;
  standings?: import("@/types/standing").CompetitionStandings;
  source: MatchListDataSource;
};
