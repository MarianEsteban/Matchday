import "server-only";

import { formatMatchDate } from "@/data/mock/matches";
import { formatDateKey } from "@/lib/match-date";
import type { Match, MatchDetails, MatchStatus, Team } from "@/types/match";
import type { MatchEvent } from "@/types/match-event";
import type { MatchStatistic } from "@/types/match-statistic";
import type { MatchLineup } from "@/types/lineup";
import type { CompetitionStandings } from "@/types/standing";

const API_FOOTBALL_BASE_URL = "https://v3.football.api-sports.io";
const API_FOOTBALL_LOGO_HOST = "https://media.api-sports.io/football/teams";

type SupportedApiCompetition = {
  id: number;
  name: string;
};

type FixtureSelectionOptions = {
  selectedDateKey: string;
  timezone?: string;
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
  { id: 848, name: "UEFA Conference League" },
  { id: 3, name: "UEFA Europa League" },
  { id: 15, name: "FIFA Club World Cup" },
  { id: 128, name: "Liga Profesional Argentina" },
  { id: 71, name: "Brasileirão Série A" },
] as const satisfies readonly SupportedApiCompetition[];

const supportedCompetitionById = new Map<number, SupportedApiCompetition>(
  supportedApiFootballCompetitions.map((competition) => [competition.id, competition]),
);

const supportedCompetitionNameAliases = new Map<string, string>([
  ["world cup", "FIFA World Cup"],
  ["fifa world cup", "FIFA World Cup"],
  ["copa mundial", "FIFA World Cup"],
  ["world cup qualification", "FIFA World Cup"],
  ["world cup qualifiers", "FIFA World Cup"],
  ["uefa champions league", "UEFA Champions League"],
  ["champions league", "UEFA Champions League"],
  ["uefa europa league", "UEFA Europa League"],
  ["europa league", "UEFA Europa League"],
  ["uefa conference league", "UEFA Conference League"],
  ["conference league", "UEFA Conference League"],
  ["fifa club world cup", "FIFA Club World Cup"],
  ["club world cup", "FIFA Club World Cup"],
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

type ApiFootballRecord = Record<string, unknown>;

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
    season?: number;
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
  timezone?: string;
};

export class FootballApiService {
  constructor(private readonly apiKey = process.env.FOOTBALL_API_KEY) {}

  async getFixtures(query: FootballApiFixturesQuery = {}): Promise<Match[]> {
    const date = formatMatchDate(query.date ?? new Date());
    const timezone = query.timezone ? `&timezone=${encodeURIComponent(query.timezone)}` : "";
    const path = `/fixtures?date=${date}${timezone}`;
    const payload = await this.fetchApi<ApiFootballFixturesResponse>(path, 60);
    const rawFixtures = payload.response ?? [];
    const rawMatches = rawFixtures
      .map((fixture) => normalizeApiFootballFixture(fixture, { onlySupportedCompetitions: false, timezone: query.timezone }))
      .filter((match): match is Match => Boolean(match));
    const curatedMatches = rawFixtures
      .map((fixture) => normalizeApiFootballFixture(fixture, { onlySupportedCompetitions: true, timezone: query.timezone }))
      .filter((match): match is Match => Boolean(match));

    logFixtureDiagnostics({
      selectedDateKey: date,
      timezone: query.timezone ?? "UTC",
      rawFixtures,
      rawCount: rawFixtures.length,
      supportedCount: curatedMatches.length,
      localDateCount: selectApiMatchesForDate(curatedMatches, rawMatches, { selectedDateKey: date, timezone: query.timezone }).length,
    });

    const selectedMatches = selectApiMatchesForDate(curatedMatches, rawMatches, { selectedDateKey: date, timezone: query.timezone });
    return this.withStandingsContexts(selectedMatches);
  }

  async getFixtureById(id: string): Promise<Match | undefined> {
    if (!/^api-football-\d+$/.test(id)) {
      return undefined;
    }

    const fixtureId = id.replace("api-football-", "");
    const matches = await this.fetchAndNormalizeFixtures(`/fixtures?id=${fixtureId}`, { onlySupportedCompetitions: true });

    const match = matches[0];
    if (!match) return undefined;
    return this.withStandingsContext(match);
  }

  async getFixtureDetails(id: string): Promise<MatchDetails | undefined> {
    const match = await this.getFixtureById(id);
    const fixtureId = match?.apiFootball?.fixtureId;
    if (!match || !fixtureId) return undefined;

    const [events, statistics, lineup, standings] = await Promise.all([
      this.getFixtureEvents(fixtureId, match),
      this.getFixtureStatistics(fixtureId, match.id),
      this.getFixtureLineups(fixtureId, match.id),
      this.getStandings(match),
    ]);

    return { match: addStandingsContext(match, standings), events, statistics, lineup, standings, source: "api-football" };
  }

  private async getFixtureEvents(fixtureId: number, match: Match): Promise<MatchEvent[]> {
    const payload = await this.fetchApi<{ response?: ApiFootballRecord[] }>(`/fixtures/events?fixture=${fixtureId}`, 300).catch(() => undefined);
    return (payload?.response ?? []).map((event, index) => normalizeEvent(event, fixtureId, index, match)).filter((event): event is MatchEvent => Boolean(event));
  }

  private async getFixtureStatistics(fixtureId: number, matchId: string): Promise<MatchStatistic[]> {
    const payload = await this.fetchApi<{ response?: ApiFootballRecord[] }>(`/fixtures/statistics?fixture=${fixtureId}`, 300).catch(() => undefined);
    const [home, away] = payload?.response ?? [];
    const homeStats = toRecordArray(home?.statistics);
    const awayStats = toRecordArray(away?.statistics);
    if (homeStats.length === 0 || awayStats.length === 0) return [];
    return homeStats.map((stat, index) => normalizeStatistic(stat, awayStats[index], matchId, index)).filter((statistic): statistic is MatchStatistic => Boolean(statistic));
  }

  private async getFixtureLineups(fixtureId: number, matchId: string): Promise<MatchLineup | undefined> {
    const payload = await this.fetchApi<{ response?: ApiFootballRecord[] }>(`/fixtures/lineups?fixture=${fixtureId}`, 300).catch(() => undefined);
    const [home, away] = payload?.response ?? [];
    if (toRecordArray(home?.startXI).length === 0 || toRecordArray(away?.startXI).length === 0) return undefined;
    return { matchId, home: normalizeLineupTeam(home, "home"), away: normalizeLineupTeam(away, "away") };
  }

  async getStandings(match: Match): Promise<CompetitionStandings | undefined> {
    const leagueId = match.apiFootball?.leagueId;
    const season = match.apiFootball?.season;
    if (!leagueId || !season) return undefined;
    const payload = await this.fetchApi<{ response?: ApiFootballRecord[] }>(`/standings?league=${leagueId}&season=${season}`, 900).catch(() => undefined);
    const league = asRecord(payload?.response?.[0]?.league);
    const groups = Array.isArray(league.standings) ? league.standings.map(toRecordArray) : [];
    const group = groups.find((rows) => rows.some((row) => {
      const team = asRecord(row.team);
      return [match.homeTeam.apiFootballId, match.awayTeam.apiFootballId].includes(Number(team.id));
    })) ?? groups[0];
    if (!group) return undefined;
    return {
      competition: match.apiFootball?.round?.match(/Group [A-Z]/)?.[0] ?? match.competition,
      rows: group.map((row) => {
        const team = asRecord(row.team);
        const all = asRecord(row.all);
        const goals = asRecord(all.goals);
        return {
          position: Number(row.rank), teamId: `api-football-team-${team.id}`, apiFootballTeamId: Number(team.id), teamName: String(team.name ?? ""),
          played: Number(all.played ?? 0), won: Number(all.win ?? 0), drawn: Number(all.draw ?? 0), lost: Number(all.lose ?? 0),
          goalsFor: Number(goals.for ?? 0), goalsAgainst: Number(goals.against ?? 0), goalDifference: Number(row.goalsDiff ?? 0), points: Number(row.points ?? 0),
        };
      }).filter((row) => row.position && row.teamName),
    };
  }

  private async withStandingsContext(match: Match) {
    return addStandingsContext(match, await this.getStandings(match));
  }

  private async withStandingsContexts(matches: Match[]): Promise<Match[]> {
    const cache = new Map<string, Promise<CompetitionStandings | undefined>>();

    return Promise.all(matches.map(async (match) => {
      const leagueId = match.apiFootball?.leagueId;
      const season = match.apiFootball?.season;
      if (!leagueId || !season) return match;
      const key = `${leagueId}:${season}`;
      if (!cache.has(key)) cache.set(key, this.getStandings(match));
      return addStandingsContext(match, await cache.get(key));
    }));
  }

  private async fetchAndNormalizeFixtures(
    path: string,
    options: { onlySupportedCompetitions: boolean; timezone?: string },
  ): Promise<Match[]> {
    if (!this.apiKey) {
      return [];
    }

    const payload = await this.fetchApi<ApiFootballFixturesResponse>(path, 60);

    return (payload.response ?? [])
      .map((fixture) => normalizeApiFootballFixture(fixture, options))
      .filter((match): match is Match => Boolean(match));
  }

  private async fetchApi<T>(path: string, revalidate: number): Promise<T> {
    if (!this.apiKey) throw new Error("Football API key is not configured");
    const response = await fetch(`${API_FOOTBALL_BASE_URL}${path}`, {
      headers: { "x-apisports-key": this.apiKey },
      next: { revalidate },
    });
    if (!response.ok) throw new Error(`Football API returned ${response.status}`);
    return response.json() as Promise<T>;
  }
}

function normalizeApiFootballFixture(
  fixture: ApiFootballFixture,
  options: { onlySupportedCompetitions: boolean; timezone?: string },
): Match | undefined {
  const fixtureId = fixture.fixture?.id;
  const startsAt = fixture.fixture?.date ? new Date(fixture.fixture.date) : undefined;
  const homeTeam = normalizeTeam(fixture.teams?.home);
  const awayTeam = normalizeTeam(fixture.teams?.away);
  const competition = normalizeCompetition(fixture.league);
  const fallbackCompetition = fixture.league?.name?.trim() || "Football";

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
    competition: competition ?? fallbackCompetition,
    kickoffTime: startsAt.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: options.timezone ?? "UTC",
    }),
    kickoffAt: startsAt.toISOString(),
    venue: venueParts.join(", ") || "TBD",
    date: formatDateKey(startsAt, options.timezone),
    status,
    apiFootball: { fixtureId, leagueId: fixture.league?.id, season: fixture.league?.season, round: fixture.league?.round },
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

  const leagueName = normalizeCompetitionKey(league?.name);
  const roundName = normalizeCompetitionKey(league?.round);

  return (leagueName ? supportedCompetitionNameAliases.get(leagueName) : undefined)
    ?? (roundName ? supportedCompetitionNameAliases.get(roundName) : undefined)
    ?? inferSupportedCompetitionName(leagueName, roundName);
}

function normalizeCompetitionKey(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function inferSupportedCompetitionName(...values: Array<string | undefined>): string | undefined {
  const text = values.filter(Boolean).join(" ");
  if (!text) return undefined;
  if (/fifa.*world cup|world cup|copa mundial/.test(text)) return "FIFA World Cup";
  if (/champions league/.test(text)) return "UEFA Champions League";
  if (/libertadores/.test(text)) return "Copa Libertadores";
  if (/sudamericana/.test(text)) return "Copa Sudamericana";
  if (/major league soccer|\bmls\b/.test(text)) return "MLS";
  if (/brasileir|brazil.*serie a/.test(text)) return "Brasileirão Série A";
  return undefined;
}

function getApiMatchPriority(match: Match): number {
  const competitionPriority: Record<string, number> = {
    "FIFA World Cup": 0,
    "FIFA Club World Cup": 1,
    "UEFA Champions League": 2,
    "Copa Libertadores": 3,
    "Copa Sudamericana": 4,
    "Premier League": 5,
    LaLiga: 6,
    "Serie A": 7,
    Bundesliga: 8,
    "Ligue 1": 9,
    "Liga Profesional Argentina": 10,
    "Brasileirão Série A": 11,
    MLS: 12,
  };
  return competitionPriority[match.competition] ?? 100;
}

function selectApiMatchesForDate(curatedMatches: Match[], rawMatches: Match[], options: FixtureSelectionOptions): Match[] {
  const matchesForDate = (matches: Match[]) => matches.filter((match) => match.date === options.selectedDateKey);
  const curatedForDate = matchesForDate(curatedMatches);
  if (curatedForDate.length > 0) return curatedForDate.sort(compareApiMatches);

  const rawForDate = matchesForDate(rawMatches);
  if (rawForDate.length === 0) return [];

  return rawForDate.sort(compareApiMatches).slice(0, 16);
}

function compareApiMatches(firstMatch: Match, secondMatch: Match): number {
  const priorityDifference = getApiMatchPriority(firstMatch) - getApiMatchPriority(secondMatch);
  if (priorityDifference !== 0) return priorityDifference;
  return getMatchTime(firstMatch) - getMatchTime(secondMatch);
}

function getMatchTime(match: Match): number {
  const time = match.kickoffAt ? new Date(match.kickoffAt).getTime() : Number.NaN;
  return Number.isNaN(time) ? 0 : time;
}

function logFixtureDiagnostics(details: { selectedDateKey: string; timezone: string; rawFixtures: ApiFootballFixture[]; rawCount: number; supportedCount: number; localDateCount: number }) {
  if (process.env.NODE_ENV === "production") return;
  const leagues = details.rawFixtures.slice(0, 6).map((fixture) => ({ id: fixture.league?.id, name: fixture.league?.name }));
  console.info("[api-football fixtures diagnostics]", {
    selectedDateKey: details.selectedDateKey,
    timezone: details.timezone,
    rawFixtures: details.rawCount,
    afterSupportedCompetitionFiltering: details.supportedCount,
    afterLocalDateFiltering: details.localDateCount,
    sampleLeagues: leagues,
  });
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
    apiFootballId: team.id,
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


function toRecordArray(value: unknown): ApiFootballRecord[] {
  return Array.isArray(value) ? value.filter((item): item is ApiFootballRecord => Boolean(item) && typeof item === "object" && !Array.isArray(item)) : [];
}

function asRecord(value: unknown): ApiFootballRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value) ? value as ApiFootballRecord : {};
}

function addStandingsContext(match: Match, standings?: CompetitionStandings): Match {
  if (!standings) return match;
  const home = standings.rows.find((row) => row.teamId === match.homeTeam.id || row.apiFootballTeamId === match.homeTeam.apiFootballId);
  const away = standings.rows.find((row) => row.teamId === match.awayTeam.id || row.apiFootballTeamId === match.awayTeam.apiFootballId);
  return home && away ? { ...match, standingsContext: { label: standings.competition, homePosition: home.position, awayPosition: away.position } } : match;
}

function normalizeEvent(event: ApiFootballRecord, fixtureId: number, index: number, match: Match): MatchEvent | undefined {
  const detail = String(event.detail ?? "");
  const rawType = String(event.type ?? "");
  const typeMap: Record<string, MatchEvent["type"]> = {
    Goal: "goal",
    Card: detail === "Red Card" ? "red-card" : "yellow-card",
    subst: "substitution",
    Var: "var",
  };
  const type = detail.toLowerCase().includes("penalty") ? "penalty" : typeMap[rawType];
  const teamRecord = asRecord(event.team);
  const time = asRecord(event.time);
  const player = asRecord(event.player);
  const assist = asRecord(event.assist);
  const minute = Number(time.elapsed);
  const playerName = typeof player.name === "string" ? player.name : undefined;
  if (!type || Number.isNaN(minute) || !playerName) return undefined;
  const eventTeam: "home" | "away" = Number(teamRecord.id) === match.awayTeam.apiFootballId ? "away" : "home";
  const base = { id: `api-football-${fixtureId}-event-${index}`, matchId: `api-football-${fixtureId}`, minute, team: eventTeam, playerName };
  if (type === "goal" || type === "penalty") return { ...base, type, assistName: typeof assist.name === "string" ? assist.name : undefined };
  if (type === "substitution") return { ...base, type, playerInName: typeof assist.name === "string" ? assist.name : playerName, playerOutName: playerName };
  return { ...base, type, reason: detail };
}

function parseStatValue(value: unknown): number | undefined {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value.replace("%", ""));
  return undefined;
}

function normalizeStatistic(home: ApiFootballRecord, away: ApiFootballRecord, matchId: string, index: number): MatchStatistic | undefined {
  const homeValue = parseStatValue(home?.value);
  const awayValue = parseStatValue(away?.value);
  const label = typeof home.type === "string" ? home.type : undefined;
  if (!label || homeValue === undefined || awayValue === undefined || Number.isNaN(homeValue) || Number.isNaN(awayValue)) return undefined;
  return { id: `${matchId}-stat-${index}`, matchId, label, unit: String(home.value).includes("%") ? "%" : undefined, values: { home: homeValue, away: awayValue } };
}

function normalizeLineupPlayer(entry: ApiFootballRecord, team: "home" | "away", index: number) {
  const player = asRecord(entry.player);
  return {
    id: String(player.id ?? `${team}-${index}`),
    name: String(player.name ?? "TBD"),
    position: String(player.pos ?? "—"),
    number: Number(player.number ?? index + 1),
  };
}

function normalizeLineupTeam(lineup: ApiFootballRecord, team: "home" | "away"): MatchLineup["home"] {
  const coach = asRecord(lineup.coach);
  return {
    team,
    formation: String(lineup.formation ?? "—"),
    startingEleven: toRecordArray(lineup.startXI).map((entry, index) => normalizeLineupPlayer(entry, team, index)),
    substitutes: toRecordArray(lineup.substitutes).map((entry, index) => normalizeLineupPlayer(entry, team, index + 12)),
    coach: typeof coach.name === "string" ? coach.name : undefined,
  };
}
