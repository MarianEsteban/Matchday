import "server-only";

import { featuredCompetitionDefinitions, getCompetitionSortPriority } from "@/data/mock/competitions";
import { formatMatchDate } from "@/data/mock/matches";
import { formatDateKey } from "@/lib/match-date";
import { getMatchdayDataMode } from "@/data/services/data-mode";
import { getOrSetInFlight, getServerCacheValue, setServerCacheValue } from "@/data/services/server-cache";
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
  country?: string;
  aliases: readonly string[];
};

type FixtureSelectionOptions = {
  selectedDateKey: string;
  timezone?: string;
};

export const supportedApiFootballCompetitions = featuredCompetitionDefinitions.map((competition) => ({
  id: competition.apiFootballLeagueId,
  name: competition.name,
  country: "country" in competition ? competition.country : undefined,
  aliases: competition.aliases,
})) satisfies SupportedApiCompetition[];

const supportedCompetitionById = new Map<number, SupportedApiCompetition>(
  supportedApiFootballCompetitions.map((competition) => [competition.id, competition]),
);

const supportedCompetitionsByAlias = supportedApiFootballCompetitions.reduce<Map<string, SupportedApiCompetition[]>>(
  (aliases, competition) => {
    competition.aliases.forEach((alias) => {
      const normalizedAlias = normalizeCompetitionKey(alias);
      if (!normalizedAlias) return;
      aliases.set(normalizedAlias, [...(aliases.get(normalizedAlias) ?? []), competition]);
    });

    return aliases;
  },
  new Map(),
);

type ApiFootballRecord = Record<string, unknown>;

type ApiFootballFixturesResponse = {
  response?: ApiFootballFixture[];
  errors?: unknown;
};

class ApiFootballQuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiFootballQuotaError";
  }
}

class ApiFootballRequestError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = "ApiFootballRequestError";
  }
}

const globalQuotaState = globalThis as typeof globalThis & { __matchdayApiFootballQuotaExhausted?: boolean };

export function isApiFootballQuotaError(error: unknown): boolean {
  return error instanceof ApiFootballQuotaError;
}

function getFixtureRevalidateSeconds(date: Date): number {
  const fixtureDate = new Date(date);
  fixtureDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (fixtureDate.getTime() === today.getTime()) return 600;
  if (fixtureDate.getTime() > today.getTime()) return 3_600;
  return 86_400;
}

function getDetailRevalidateSeconds(match?: Match): number {
  return match?.status === "live" ? 300 : 21_600;
}

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
    country?: string;
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
  private lastFixturesFromCache = false;

  constructor(private readonly apiKey = process.env.FOOTBALL_API_KEY) {}

  didLastFixturesUseCache() {
    return this.lastFixturesFromCache;
  }

  async getFixtures(query: FootballApiFixturesQuery = {}): Promise<Match[]> {
    const date = formatMatchDate(query.date ?? new Date());
    const timezone = query.timezone ? `&timezone=${encodeURIComponent(query.timezone)}` : "";
    const apiDateKeys = getApiDateKeysForSelectedDate(date);
    const revalidate = getFixtureRevalidateSeconds(query.date ?? new Date());
    const mode = getMatchdayDataMode();
    this.lastFixturesFromCache = false;
    const payloads = await Promise.all(apiDateKeys.map(async (apiDateKey) => {
      const path = `/fixtures?date=${apiDateKey}${timezone}`;
      const cacheKey = `api-football:${mode}:fixtures:${apiDateKey}:tz:${query.timezone ?? "UTC"}`;
      const { payload, fromCache } = await this.fetchCachedApi<ApiFootballFixturesResponse>(path, revalidate, cacheKey);
      if (fromCache) this.lastFixturesFromCache = true;
      return { apiDateKey, fixtures: payload.response ?? [] };
    }));
    const rawFixtures = dedupeApiFixtures(payloads.flatMap((payload) => payload.fixtures));
    const rawMatches = rawFixtures
      .map((fixture) => normalizeApiFootballFixture(fixture, { onlySupportedCompetitions: false, timezone: query.timezone }))
      .filter((match): match is Match => Boolean(match));
    const curatedMatches = rawFixtures
      .map((fixture) => normalizeApiFootballFixture(fixture, { onlySupportedCompetitions: true, timezone: query.timezone }))
      .filter((match): match is Match => Boolean(match));

    logFixtureDiagnostics({
      selectedDateKey: date,
      timezone: query.timezone ?? "UTC",
      apiDateKeys,
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
    const matches = await this.fetchAndNormalizeFixtures(`/fixtures?id=${fixtureId}`, { onlySupportedCompetitions: false });

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
      this.getFixtureStatistics(fixtureId, match),
      this.getFixtureLineups(fixtureId, match),
      this.getStandings(match),
    ]);

    return { match: addStandingsContext(match, standings), events, statistics, lineup, standings, source: "api-football" };
  }

  private async getFixtureEvents(fixtureId: number, match: Match): Promise<MatchEvent[]> {
    const result = await this.fetchCachedApi<{ response?: ApiFootballRecord[] }>(`/fixtures/events?fixture=${fixtureId}`, getDetailRevalidateSeconds(match), `api-football:events:${fixtureId}`).catch(() => undefined);
    const payload = result?.payload;
    return (payload?.response ?? []).map((event, index) => normalizeEvent(event, fixtureId, index, match)).filter((event): event is MatchEvent => Boolean(event));
  }

  private async getFixtureStatistics(fixtureId: number, match: Match): Promise<MatchStatistic[]> {
    const matchId = match.id;
    const result = await this.fetchCachedApi<{ response?: ApiFootballRecord[] }>(`/fixtures/statistics?fixture=${fixtureId}`, getDetailRevalidateSeconds(match), `api-football:statistics:${fixtureId}`).catch(() => undefined);
    const payload = result?.payload;
    const [home, away] = payload?.response ?? [];
    const homeStats = toRecordArray(home?.statistics);
    const awayStats = toRecordArray(away?.statistics);
    if (homeStats.length === 0 || awayStats.length === 0) return [];
    return homeStats.map((stat, index) => normalizeStatistic(stat, awayStats[index], matchId, index)).filter((statistic): statistic is MatchStatistic => Boolean(statistic));
  }

  private async getFixtureLineups(fixtureId: number, match: Match): Promise<MatchLineup | undefined> {
    const matchId = match.id;
    const result = await this.fetchCachedApi<{ response?: ApiFootballRecord[] }>(`/fixtures/lineups?fixture=${fixtureId}`, getDetailRevalidateSeconds(match), `api-football:lineups:${fixtureId}`).catch(() => undefined);
    const payload = result?.payload;
    const [home, away] = payload?.response ?? [];
    if (toRecordArray(home?.startXI).length === 0 || toRecordArray(away?.startXI).length === 0) return undefined;
    return { matchId, home: normalizeLineupTeam(home, "home"), away: normalizeLineupTeam(away, "away") };
  }

  async getStandings(match: Match): Promise<CompetitionStandings | undefined> {
    const leagueId = match.apiFootball?.leagueId;
    const season = match.apiFootball?.season;
    if (!leagueId || !season) return undefined;
    const result = await this.fetchCachedApi<{ response?: ApiFootballRecord[] }>(`/standings?league=${leagueId}&season=${season}`, 21_600, `api-football:standings:${leagueId}:${season}`).catch(() => undefined);
    const payload = result?.payload;
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
      if (!leagueId || !season || getCompetitionSortPriority(match.competition) === Number.MAX_SAFE_INTEGER) return match;
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

    const { payload } = await this.fetchCachedApi<ApiFootballFixturesResponse>(path, 600, `api-football:fixture:${path}`);

    return (payload.response ?? [])
      .map((fixture) => normalizeApiFootballFixture(fixture, options))
      .filter((match): match is Match => Boolean(match));
  }

  private async fetchCachedApi<T>(path: string, revalidate: number, cacheKey: string): Promise<{ payload: T; fromCache: boolean }> {
    const cached = getServerCacheValue<T>(cacheKey);
    if (cached) return { payload: cached, fromCache: true };

    if (globalQuotaState.__matchdayApiFootballQuotaExhausted) {
      const stale = getServerCacheValue<T>(cacheKey, { allowStale: true });
      if (stale) return { payload: stale, fromCache: true };
      throw new ApiFootballQuotaError("API-Football quota is exhausted for this runtime session");
    }

    return getOrSetInFlight(`${cacheKey}:load`, async () => {
      try {
        const payload = await this.fetchApi<T>(path, revalidate);
        return { payload: setServerCacheValue(cacheKey, payload, revalidate), fromCache: false };
      } catch (error) {
        const stale = getServerCacheValue<T>(cacheKey, { allowStale: true });
        if (stale) return { payload: stale, fromCache: true };
        throw error;
      }
    });
  }

  private async fetchApi<T>(path: string, revalidate: number): Promise<T> {
    if (!this.apiKey) throw new Error("Football API key is not configured");
    const response = await fetch(`${API_FOOTBALL_BASE_URL}${path}`, {
      cache: "force-cache",
      headers: { "x-apisports-key": this.apiKey },
      next: { revalidate },
    });
    if (response.status === 429) {
      globalQuotaState.__matchdayApiFootballQuotaExhausted = true;
      console.warn("API-Football quota/rate limit reached. Serving cache or demo fallback for this runtime session.");
      throw new ApiFootballQuotaError("API-Football quota/rate limit reached");
    }
    if (!response.ok) throw new ApiFootballRequestError(`Football API returned ${response.status}`, response.status);
    const payload = await response.json() as T;
    if (hasQuotaErrorPayload(payload)) {
      globalQuotaState.__matchdayApiFootballQuotaExhausted = true;
      console.warn("API-Football quota/rate limit payload detected. Serving cache or demo fallback for this runtime session.");
      throw new ApiFootballQuotaError("API-Football quota/rate limit payload detected");
    }
    return payload;
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
  const competition = normalizeCompetition(fixture);
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
    apiFootball: {
      fixtureId,
      leagueId: fixture.league?.id,
      leagueName: fixture.league?.name,
      leagueCountry: fixture.league?.country,
      season: fixture.league?.season,
      round: fixture.league?.round,
    },
    ...(hasScore ? { score: { home: homeGoals, away: awayGoals } } : {}),
  };
}

function normalizeCompetition(fixture: ApiFootballFixture): string | undefined {
  return getSupportedCompetitionMatch(fixture)?.name;
}

function getSupportedCompetitionMatch(fixture: ApiFootballFixture): SupportedApiCompetition | undefined {
  const league = fixture.league;

  if (typeof league?.id === "number") {
    const supportedCompetition = supportedCompetitionById.get(league.id);

    if (supportedCompetition) {
      return supportedCompetition;
    }
  }

  const leagueName = normalizeCompetitionKey(league?.name);
  if (!leagueName) return undefined;

  if (isExplicitWorldCupLeagueName(leagueName)) {
    return hasNationalTeams(fixture) ? supportedCompetitionById.get(1) : undefined;
  }

  const country = normalizeCompetitionKey(league?.country);
  const aliasMatches = supportedCompetitionsByAlias.get(leagueName) ?? [];

  return aliasMatches.find((competition) => {
    if (!competition.country) return true;
    return country === normalizeCompetitionKey(competition.country);
  });
}

function normalizeCompetitionKey(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function isExplicitWorldCupLeagueName(leagueName: string | undefined): boolean {
  return leagueName === "fifa world cup" || leagueName === "world cup";
}

function hasNationalTeams(fixture: ApiFootballFixture): boolean {
  return isNationalTeamName(fixture.teams?.home?.name) && isNationalTeamName(fixture.teams?.away?.name);
}

function isNationalTeamName(teamName: string | undefined): boolean {
  const normalizedName = normalizeCompetitionKey(teamName);

  return Boolean(normalizedName && nationalTeamNames.has(normalizedName));
}

function doesFixtureLookLikeWorldCup(fixture: ApiFootballFixture): boolean {
  return fixture.league?.id === 1 || isExplicitWorldCupLeagueName(normalizeCompetitionKey(fixture.league?.name));
}

const nationalTeamNames = new Set([
  "afghanistan", "albania", "algeria", "american samoa", "andorra", "angola", "anguilla", "antigua and barbuda", "argentina", "armenia", "aruba", "australia", "austria", "azerbaijan",
  "bahamas", "bahrain", "bangladesh", "barbados", "belarus", "belgium", "belize", "benin", "bermuda", "bhutan", "bolivia", "bosnia and herzegovina", "botswana", "brazil", "british virgin islands", "brunei", "bulgaria", "burkina faso", "burundi",
  "cambodia", "cameroon", "canada", "cape verde", "cayman islands", "central african republic", "chad", "chile", "china", "chinese taipei", "colombia", "comoros", "congo", "costa rica", "croatia", "cuba", "curacao", "cyprus", "czech republic", "czechia",
  "denmark", "djibouti", "dominica", "dominican republic", "dr congo",
  "ecuador", "egypt", "el salvador", "england", "equatorial guinea", "eritrea", "estonia", "eswatini", "ethiopia",
  "faroe islands", "fiji", "finland", "france",
  "gabon", "gambia", "georgia", "germany", "ghana", "gibraltar", "greece", "grenada", "guam", "guatemala", "guinea", "guinea bissau", "guyana",
  "haiti", "honduras", "hong kong", "hungary",
  "iceland", "india", "indonesia", "iran", "iraq", "israel", "italy", "ivory coast", "cote d ivoire",
  "jamaica", "japan", "jordan",
  "kazakhstan", "kenya", "korea republic", "kosovo", "kuwait", "kyrgyzstan",
  "laos", "latvia", "lebanon", "lesotho", "liberia", "libya", "liechtenstein", "lithuania", "luxembourg",
  "macau", "madagascar", "malawi", "malaysia", "maldives", "mali", "malta", "mauritania", "mauritius", "mexico", "moldova", "mongolia", "montenegro", "montserrat", "morocco", "mozambique", "myanmar",
  "namibia", "nepal", "netherlands", "new caledonia", "new zealand", "nicaragua", "niger", "nigeria", "north korea", "north macedonia", "northern ireland", "norway",
  "oman",
  "pakistan", "palestine", "panama", "papua new guinea", "paraguay", "peru", "philippines", "poland", "portugal", "puerto rico",
  "qatar",
  "republic of ireland", "romania", "russia", "rwanda",
  "saint kitts and nevis", "saint lucia", "saint vincent and the grenadines", "samoa", "san marino", "sao tome and principe", "saudi arabia", "scotland", "senegal", "serbia", "seychelles", "sierra leone", "singapore", "slovakia", "slovenia", "solomon islands", "somalia", "south africa", "south korea", "south sudan", "spain", "sri lanka", "sudan", "suriname", "sweden", "switzerland", "syria",
  "tahiti", "tajikistan", "tanzania", "thailand", "timor leste", "togo", "tonga", "trinidad and tobago", "tunisia", "turkey", "turkmenistan", "turks and caicos islands",
  "uganda", "ukraine", "united arab emirates", "united states", "uruguay", "usa", "uzbekistan",
  "vanuatu", "venezuela", "vietnam",
  "wales",
  "yemen",
  "zambia", "zimbabwe",
]);

function getApiMatchPriority(match: Match): number {
  return getCompetitionSortPriority(match.competition);
}

function selectApiMatchesForDate(_curatedMatches: Match[], rawMatches: Match[], options: FixtureSelectionOptions): Match[] {
  return rawMatches
    .filter((match) => match.date === options.selectedDateKey)
    .sort(compareApiMatches);
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

function getApiDateKeysForSelectedDate(selectedDateKey: string): string[] {
  const selectedDate = new Date(`${selectedDateKey}T00:00:00Z`);
  return [-1, 0, 1].map((daysToShift) => {
    const date = new Date(selectedDate);
    date.setUTCDate(date.getUTCDate() + daysToShift);
    return formatMatchDate(date);
  });
}

function dedupeApiFixtures(fixtures: ApiFootballFixture[]): ApiFootballFixture[] {
  const fixturesById = new Map<number, ApiFootballFixture>();
  for (const fixture of fixtures) {
    const fixtureId = fixture.fixture?.id;
    if (fixtureId && !fixturesById.has(fixtureId)) fixturesById.set(fixtureId, fixture);
  }
  return [...fixturesById.values()];
}

function logFixtureDiagnostics(details: { apiDateKeys: string[]; selectedDateKey: string; timezone: string; rawFixtures: ApiFootballFixture[]; rawCount: number; supportedCount: number; localDateCount: number }) {
  if (process.env.NODE_ENV === "production") return;
  const excludedFixtures = details.rawFixtures
    .filter((fixture) => !getSupportedCompetitionMatch(fixture))
    .slice(0, 25)
    .map((fixture) => ({
      fixtureId: fixture.fixture?.id,
      leagueId: fixture.league?.id,
      leagueName: fixture.league?.name,
      country: fixture.league?.country,
      round: fixture.league?.round,
      home: fixture.teams?.home?.name,
      away: fixture.teams?.away?.name,
      reason: getFixtureExclusionReason(fixture),
    }));
  const worldCupFixtures = details.rawFixtures.filter(doesFixtureLookLikeWorldCup).map((fixture) => ({
    id: fixture.fixture?.id,
    apiDate: fixture.fixture?.date?.slice(0, 10),
    localDate: fixture.fixture?.date ? formatDateKey(new Date(fixture.fixture.date), details.timezone) : undefined,
    leagueId: fixture.league?.id,
    leagueName: fixture.league?.name,
    country: fixture.league?.country,
    round: fixture.league?.round,
    home: fixture.teams?.home?.name,
    away: fixture.teams?.away?.name,
    includedAsFeatured: Boolean(getSupportedCompetitionMatch(fixture)),
  }));
  console.info("[api-football fixtures diagnostics]", {
    selectedDateKey: details.selectedDateKey,
    queriedApiDateKeys: details.apiDateKeys,
    timezone: details.timezone,
    rawFixtures: details.rawCount,
    afterSupportedCompetitionFiltering: details.supportedCount,
    afterLocalDateFiltering: details.localDateCount,
    excludedFixtures,
    worldCupFixtures,
  });
}

function getFixtureExclusionReason(fixture: ApiFootballFixture): string {
  const leagueName = normalizeCompetitionKey(fixture.league?.name);
  const leagueId = fixture.league?.id;
  if (typeof leagueId === "number" && !supportedCompetitionById.has(leagueId)) return "league id is not in featured competitions";
  if (!leagueName) return "missing league name";
  const aliasMatches = supportedCompetitionsByAlias.get(leagueName) ?? [];
  if (aliasMatches.length === 0) return "league name is not a featured competition alias";
  if (isExplicitWorldCupLeagueName(leagueName) && !hasNationalTeams(fixture)) return "World Cup name matched but teams are not verified national teams";
  return "league name matched an alias but country did not match expected featured country";
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

function hasQuotaErrorPayload(payload: unknown): boolean {
  const errors = (payload as { errors?: unknown })?.errors;
  const text = typeof errors === "string" ? errors : JSON.stringify(errors ?? "");
  return /quota|rate|limit|request/i.test(text);
}
