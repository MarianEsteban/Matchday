import "server-only";

import { createMockMatches, formatMatchDate } from "@/data/mock/matches";
import type { Match } from "@/types/match";

export type MatchQuery = {
  date?: Date;
};

export type MatchDataSource = {
  getMatches(query?: MatchQuery): Promise<Match[]> | Match[];
  getMatchById(id: string): Promise<Match | undefined> | Match | undefined;
};

export class DemoMatchDataSource implements MatchDataSource {
  getMatches(query: MatchQuery = {}): Match[] {
    return createMockMatches(query.date);
  }

  getMatchById(id: string): Match | undefined {
    return createMockMatches().find((match) => match.id === id);
  }
}

export class ApiMatchDataSource implements MatchDataSource {
  constructor(private readonly baseUrl: string) {}

  async getMatches(query: MatchQuery = {}): Promise<Match[]> {
    const requestedDate = query.date ? formatMatchDate(query.date) : formatMatchDate(new Date());
    const response = await fetch(`${this.baseUrl}/matches?date=${requestedDate}`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error(`Match API returned ${response.status}`);
    }

    return response.json() as Promise<Match[]>;
  }

  async getMatchById(id: string): Promise<Match | undefined> {
    const response = await fetch(`${this.baseUrl}/matches/${id}`, {
      next: { revalidate: 60 },
    });

    if (response.status === 404) {
      return undefined;
    }

    if (!response.ok) {
      throw new Error(`Match API returned ${response.status}`);
    }

    return response.json() as Promise<Match>;
  }
}

export function createMatchDataSource(): MatchDataSource {
  const apiBaseUrl = process.env.MATCHDAY_FOOTBALL_API_BASE_URL;

  if (apiBaseUrl) {
    return new ApiMatchDataSource(apiBaseUrl);
  }

  return new DemoMatchDataSource();
}
