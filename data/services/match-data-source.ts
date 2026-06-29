import "server-only";

import { createMockMatches } from "@/data/mock/matches";
import { FootballApiService } from "@/data/services/football-api.service";
import { getMatchdayDataMode } from "@/data/services/data-mode";
import type { Match, MatchDetails, MatchListDataSource } from "@/types/match";

export type MatchQuery = {
  date?: Date;
  timezone?: string;
};

export type MatchDataSource = {
  source: MatchListDataSource;
  getMatches(query?: MatchQuery): Promise<Match[]> | Match[];
  getMatchById(id: string): Promise<Match | undefined> | Match | undefined;
  getMatchDetailsById?(id: string): Promise<MatchDetails | undefined> | MatchDetails | undefined;
  didLastFixturesUseCache?(): boolean;
};

export class DemoMatchDataSource implements MatchDataSource {
  readonly source = "demo" satisfies MatchListDataSource;

  getMatches(query: MatchQuery = {}): Match[] {
    return createMockMatches(query.date);
  }

  getMatchById(id: string): Match | undefined {
    return createMockMatches().find((match) => match.id === id);
  }
}

export class FootballApiMatchDataSource implements MatchDataSource {
  readonly source = "api-football" satisfies MatchListDataSource;

  constructor(private readonly footballApi = new FootballApiService()) {}

  async getMatches(query: MatchQuery = {}): Promise<Match[]> {
    return this.footballApi.getFixtures(query);
  }

  didLastFixturesUseCache() {
    return this.footballApi.didLastFixturesUseCache();
  }

  getMatchById(id: string): Promise<Match | undefined> {
    return this.footballApi.getFixtureById(id);
  }

  getMatchDetailsById(id: string): Promise<MatchDetails | undefined> {
    return this.footballApi.getFixtureDetails(id);
  }
}

export function createMatchDataSource(): MatchDataSource {
  const dataMode = getMatchdayDataMode();

  if (dataMode === "demo") {
    return new DemoMatchDataSource();
  }

  if (process.env.FOOTBALL_API_KEY) {
    // The real football provider selection lives here so API keys stay server-side.
    // Add future providers by swapping or composing MatchDataSource implementations.
    return new FootballApiMatchDataSource();
  }

  if (dataMode === "api") {
    console.warn("MATCHDAY_DATA_MODE=api is set, but FOOTBALL_API_KEY is not configured. Using demo fallback.");
  }

  return new DemoMatchDataSource();
}
