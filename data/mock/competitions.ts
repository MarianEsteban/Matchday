export type FeaturedCompetitionDefinition = {
  apiFootballLeagueId: number;
  name: string;
  country?: string;
  aliases: readonly string[];
  currentSeason?: number;
};

export const featuredCompetitionDefinitions = [
  { apiFootballLeagueId: 1, name: "FIFA World Cup", aliases: ["fifa world cup", "world cup"], currentSeason: 2026 },
  { apiFootballLeagueId: 2, name: "UEFA Champions League", aliases: ["uefa champions league", "champions league"] },
  { apiFootballLeagueId: 13, name: "Copa Libertadores", aliases: ["conmebol libertadores", "copa libertadores"] },
  { apiFootballLeagueId: 11, name: "Copa Sudamericana", aliases: ["conmebol sudamericana", "copa sudamericana"] },
  { apiFootballLeagueId: 39, name: "Premier League", country: "England", aliases: ["premier league"] },
  { apiFootballLeagueId: 140, name: "LaLiga", country: "Spain", aliases: ["la liga", "laliga", "primera division"] },
  { apiFootballLeagueId: 135, name: "Serie A", country: "Italy", aliases: ["serie a"] },
  { apiFootballLeagueId: 78, name: "Bundesliga", country: "Germany", aliases: ["bundesliga"] },
  { apiFootballLeagueId: 61, name: "Ligue 1", country: "France", aliases: ["ligue 1"] },
  { apiFootballLeagueId: 94, name: "Primeira Liga Portugal", country: "Portugal", aliases: ["primeira liga", "liga portugal", "primeira liga portugal"] },
  { apiFootballLeagueId: 128, name: "Liga Profesional Argentina", country: "Argentina", aliases: ["liga profesional argentina", "primera division"] },
  { apiFootballLeagueId: 71, name: "Brasileirão Série A", country: "Brazil", aliases: ["serie a", "serie a brazil", "brasileiro serie a", "brasileirao serie a", "brasileirão série a"] },
  { apiFootballLeagueId: 253, name: "MLS", country: "USA", aliases: ["major league soccer", "mls"] },
] as const satisfies readonly FeaturedCompetitionDefinition[];

export type SidebarCompetition = {
  name: string;
  fallbackMatchCount: number;
};

export type SidebarSection = {
  title: string;
  competitions: SidebarCompetition[];
};

export const sidebarSections: SidebarSection[] = [
  {
    title: "Today",
    competitions: [
      { name: "FIFA World Cup", fallbackMatchCount: 0 },
    ],
  },
  {
    title: "Argentina",
    competitions: [
      { name: "FIFA World Cup", fallbackMatchCount: 0 },
      { name: "Liga Profesional Argentina", fallbackMatchCount: 0 },
    ],
  },
  {
    title: "World Cup 2026",
    competitions: [
      { name: "FIFA World Cup", fallbackMatchCount: 0 },
    ],
  },
  {
    title: "International",
    competitions: [{ name: "FIFA World Cup", fallbackMatchCount: 0 }],
  },
  {
    title: "Europe",
    competitions: [
      { name: "UEFA Champions League", fallbackMatchCount: 0 },
      { name: "Premier League", fallbackMatchCount: 0 },
      { name: "LaLiga", fallbackMatchCount: 0 },
      { name: "Serie A", fallbackMatchCount: 0 },
      { name: "Bundesliga", fallbackMatchCount: 0 },
      { name: "Ligue 1", fallbackMatchCount: 0 },
      { name: "Primeira Liga Portugal", fallbackMatchCount: 0 },
    ],
  },
  {
    title: "America",
    competitions: [
      { name: "Copa Libertadores", fallbackMatchCount: 0 },
      { name: "Copa Sudamericana", fallbackMatchCount: 0 },
      { name: "MLS", fallbackMatchCount: 0 },
      { name: "Brasileirão Série A", fallbackMatchCount: 0 },
      { name: "Liga Profesional Argentina", fallbackMatchCount: 0 },
    ],
  },
];

export const featuredCompetitionPriority = featuredCompetitionDefinitions.map((competition) => competition.name);

const competitionPriority = new Map<string, number>(
  featuredCompetitionPriority.map((competition, index) => [competition, index]),
);

sidebarSections.forEach((section, sectionIndex) => {
  section.competitions.forEach((competition, competitionIndex) => {
    if (!competitionPriority.has(competition.name)) {
      competitionPriority.set(competition.name, featuredCompetitionPriority.length + sectionIndex * 100 + competitionIndex);
    }
  });
});

export function getCompetitionSortPriority(competitionName: string) {
  return competitionPriority.get(competitionName) ?? Number.MAX_SAFE_INTEGER;
}


export function getFeaturedCompetitionDefinition(competitionName: string) {
  return featuredCompetitionDefinitions.find((competition) => competition.name === competitionName);
}

export function getFeaturedCompetitionNameForMatch(match: Pick<import("@/types/match").Match, "competition" | "apiFootball">): string | undefined {
  const leagueId = match.apiFootball?.leagueId;
  if (typeof leagueId === "number") {
    const byId = featuredCompetitionDefinitions.find((competition) => competition.apiFootballLeagueId === leagueId);
    if (byId) return byId.name;
  }

  return (featuredCompetitionPriority as readonly string[]).includes(match.competition) ? match.competition : undefined;
}

export function getFeaturedCompetitionReasonForMatch(match: Pick<import("@/types/match").Match, "competition" | "apiFootball">) {
  const leagueId = match.apiFootball?.leagueId;
  if (typeof leagueId === "number") {
    const byId = featuredCompetitionDefinitions.find((competition) => competition.apiFootballLeagueId === leagueId);
    if (byId) return `included: API-Football league id ${leagueId} maps to ${byId.name}`;
  }

  if ((featuredCompetitionPriority as readonly string[]).includes(match.competition)) {
    return `included: canonical competition ${match.competition} is featured`;
  }

  return `excluded: ${match.competition} is not a featured competition and API-Football league id is not verified`;
}

export function isFeaturedCompetitionMatch(match: Pick<import("@/types/match").Match, "competition" | "apiFootball">) {
  return Boolean(getFeaturedCompetitionNameForMatch(match));
}
