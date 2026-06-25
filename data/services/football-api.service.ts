import "server-only";

import { formatMatchDate } from "@/data/mock/matches";
import type { Match, MatchStatus, Team } from "@/types/match";

const API_FOOTBALL_BASE_URL = "https://v3.football.api-sports.io";
const API_FOOTBALL_LOGO_HOST = "https://media.api-sports.io/football/teams";

type SupportedApiCompetition = {
  id: number;
  name: string;
};

export const supportedApiFootballCompetitions = [
  { id: 1, name: "FIFA World Cup" },
  { id: 2, name: "UEFA Champions League" },
  { id: 13, name: "Copa Libertadores" },
  { id: 11, name: "Copa Sudamericana" },
  { id: 39, name: "Premier League" },
  { id: 140, name: "LaLiga" },
  { id: 135, name: "Serie A" },
  { id: 78, name: "Bundesliga" },
  { id: 61, name: "Ligue 1" },
  { id: 253, name: "MLS" },
  { id: 128, name: "Liga Profesional Argentina" },
  { id: 71, name: "Brasileirão Série A" },
] as const satisfies readonly SupportedApiCompetition[];

const supportedCompetitionById = new Map<number, SupportedApiCompetition>(
  supportedApiFootballCompetitions.map((competition) => [competition.id, competition]),
);

const supportedCompetitionNameAliases = new Map<string, string>([
  ["world cup", "FIFA World Cup"],
  ["fifa world cup", "FIFA World Cup"],
  ["uefa champions league", "UEFA Champions League"],
  ["conmebol libertadores", "Copa Libertadores"],
  ["copa libertadores", "Copa Libertadores"],
  ["conmebol sudamericana", "Copa Sudamericana"],
  ["copa sudamericana", "Copa Sudamericana"],
  ["premier league", "Premier League"],
  ["la liga", "LaLiga"],
  ["laliga", "LaLiga"],
  ["serie a", "Serie A"],
  ["bundesliga", "Bundesliga"],
  ["ligue 1", "Ligue 1"],
  ["major league soccer", "MLS"],
  ["mls", "MLS"],
  ["liga profesional argentina", "Liga Profesional Argentina"],
  ["primera division", "Liga Profesional Argentina"],
  ["serie a brazil", "Brasileirão Série A"],
  ["brasileiro serie a", "Brasileirão Série A"],
  ["brasileirão série a", "Brasileirão Série A"],
]);

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
    id?: number;
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
    return this.fetchAndNormalizeFixtures(`/fixtures?date=${date}`, { onlySupportedCompetitions: true });
  }

  async getFixtureById(id: string): Promise<Match | undefined> {
    if (!/^api-football-\d+$/.test(id)) {
      return undefined;
    }

    const fixtureId = id.replace("api-football-", "");
    const matches = await this.fetchAndNormalizeFixtures(`/fixtures?id=${fixtureId}`, { onlySupportedCompetitions: true });

    return matches[0];
  }

  private async fetchAndNormalizeFixtures(
    path: string,
    options: { onlySupportedCompetitions: boolean },
  ): Promise<Match[]> {
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
      .map((fixture) => normalizeApiFootballFixture(fixture, options))
      .filter((match): match is Match => Boolean(match));
  }
}

function normalizeApiFootballFixture(
  fixture: ApiFootballFixture,
  options: { onlySupportedCompetitions: boolean },
): Match | undefined {
  const fixtureId = fixture.fixture?.id;
  const startsAt = fixture.fixture?.date ? new Date(fixture.fixture.date) : undefined;
  const homeTeam = normalizeTeam(fixture.teams?.home);
  const awayTeam = normalizeTeam(fixture.teams?.away);
  const competition = normalizeCompetition(fixture.league);

  if (
    !fixtureId ||
    !startsAt ||
    Number.isNaN(startsAt.getTime()) ||
    !homeTeam ||
    !awayTeam ||
    (options.onlySupportedCompetitions && !competition)
  ) {
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
    competition: competition ?? "Football",
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

function normalizeCompetition(league: ApiFootballFixture["league"]): string | undefined {
  if (typeof league?.id === "number") {
    const supportedCompetition = supportedCompetitionById.get(league.id);

    if (supportedCompetition) {
      return supportedCompetition.name;
    }
  }

  const leagueName = league?.name?.trim().toLowerCase();

  return leagueName ? supportedCompetitionNameAliases.get(leagueName) : undefined;
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
