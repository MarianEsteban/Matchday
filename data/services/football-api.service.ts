import "server-only";

import { formatMatchDate } from "@/data/mock/matches";
import type { Match, MatchStatus, Team } from "@/types/match";

const API_FOOTBALL_BASE_URL = "https://v3.football.api-sports.io";
const API_FOOTBALL_LOGO_HOST = "https://media.api-sports.io/football/teams";

type ApiFootballFixturesResponse = {
  response?: ApiFootballFixture[];
};

type ApiFootballFixture = {
  fixture?: {
    id?: number;
    date?: string;
    status?: {
      short?: string;
    };
    venue?: {
      name?: string | null;
      city?: string | null;
    };
  };
  league?: {
    name?: string;
    round?: string;
  };
  teams?: {
    home?: ApiFootballTeam;
    away?: ApiFootballTeam;
  };
  goals?: {
    home?: number | null;
    away?: number | null;
  };
};

type ApiFootballTeam = {
  id?: number;
  name?: string;
  logo?: string;
};

export type FootballApiFixturesQuery = {
  date?: Date;
};

export class FootballApiService {
  constructor(private readonly apiKey = process.env.FOOTBALL_API_KEY) {}

  async getFixtures(query: FootballApiFixturesQuery = {}): Promise<Match[]> {
    const date = formatMatchDate(query.date ?? new Date());
    return this.fetchAndNormalizeFixtures(`/fixtures?date=${date}`);
  }

  async getFixtureById(id: string): Promise<Match | undefined> {
    if (!/^api-football-\d+$/.test(id)) {
      return undefined;
    }

    const fixtureId = id.replace("api-football-", "");
    const matches = await this.fetchAndNormalizeFixtures(`/fixtures?id=${fixtureId}`);

    return matches[0];
  }

  private async fetchAndNormalizeFixtures(path: string): Promise<Match[]> {
    if (!this.apiKey) {
      return [];
    }

    const response = await fetch(`${API_FOOTBALL_BASE_URL}${path}`, {
      headers: {
        "x-apisports-key": this.apiKey,
      },
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error(`Football API returned ${response.status}`);
    }

    const payload = (await response.json()) as ApiFootballFixturesResponse;

    return (payload.response ?? [])
      .map(normalizeApiFootballFixture)
      .filter((match): match is Match => Boolean(match));
  }
}

function normalizeApiFootballFixture(fixture: ApiFootballFixture): Match | undefined {
  const fixtureId = fixture.fixture?.id;
  const startsAt = fixture.fixture?.date ? new Date(fixture.fixture.date) : undefined;
  const homeTeam = normalizeTeam(fixture.teams?.home);
  const awayTeam = normalizeTeam(fixture.teams?.away);

  if (!fixtureId || !startsAt || Number.isNaN(startsAt.getTime()) || !homeTeam || !awayTeam) {
    return undefined;
  }

  const status = normalizeStatus(fixture.fixture?.status?.short);
  const homeGoals = fixture.goals?.home;
  const awayGoals = fixture.goals?.away;
  const hasScore = typeof homeGoals === "number" && typeof awayGoals === "number";
  const venueParts = [fixture.fixture?.venue?.name, fixture.fixture?.venue?.city].filter(Boolean);

  return {
    id: `api-football-${fixtureId}`,
    homeTeam,
    awayTeam,
    competition: fixture.league?.round ?? fixture.league?.name ?? "Football",
    kickoffTime: startsAt.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    }),
    venue: venueParts.join(", ") || "TBD",
    date: formatMatchDate(startsAt),
    status,
    ...(hasScore ? { score: { home: homeGoals, away: awayGoals } } : {}),
  };
}

function normalizeTeam(team: ApiFootballTeam | undefined): Team | undefined {
  if (!team?.id || !team.name) {
    return undefined;
  }

  return {
    id: `api-football-team-${team.id}`,
    name: team.name,
    countryCode: "",
    crestUrl: team.logo ?? `${API_FOOTBALL_LOGO_HOST}/${team.id}.png`,
  };
}

function normalizeStatus(status: string | undefined): MatchStatus {
  if (["1H", "HT", "2H", "ET", "BT", "P", "SUSP", "INT", "LIVE"].includes(status ?? "")) {
    return "live";
  }

  if (["FT", "AET", "PEN", "CANC", "ABD", "AWD", "WO"].includes(status ?? "")) {
    return "finished";
  }

  return "scheduled";
}
