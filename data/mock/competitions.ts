export type SidebarCompetition = {
  name: string;
  fallbackMatchCount: number;
};

export type SidebarSection = {
  title: string;
  competitions: SidebarCompetition[];
};

const worldCupGroups: SidebarCompetition[] = Array.from({ length: 12 }, (_, index) => ({
  name: `Group ${String.fromCharCode(65 + index)}`,
  fallbackMatchCount: 0,
}));

export const sidebarSections: SidebarSection[] = [
  {
    title: "Today",
    competitions: [
      { name: "Group J", fallbackMatchCount: 0 },
      { name: "Group C", fallbackMatchCount: 0 },
      { name: "Group K", fallbackMatchCount: 0 },
      { name: "Group A", fallbackMatchCount: 0 },
      { name: "Group B", fallbackMatchCount: 0 },
      { name: "Group D", fallbackMatchCount: 0 },
      { name: "Group E", fallbackMatchCount: 0 },
      { name: "Group F", fallbackMatchCount: 0 },
      { name: "Group G", fallbackMatchCount: 0 },
      { name: "Group H", fallbackMatchCount: 0 },
      { name: "Group I", fallbackMatchCount: 0 },
      { name: "Group L", fallbackMatchCount: 0 },
    ],
  },
  {
    title: "Argentina",
    competitions: [
      { name: "Group J", fallbackMatchCount: 0 },
      { name: "Liga Profesional Argentina", fallbackMatchCount: 0 },
    ],
  },
  {
    title: "World Cup 2026",
    competitions: [
      { name: "FIFA World Cup 2026", fallbackMatchCount: 0 },
      ...worldCupGroups,
      { name: "Round of 32", fallbackMatchCount: 0 },
      { name: "Round of 16", fallbackMatchCount: 0 },
      { name: "Quarterfinals", fallbackMatchCount: 0 },
      { name: "Semifinals", fallbackMatchCount: 0 },
      { name: "Final", fallbackMatchCount: 0 },
    ],
  },
  {
    title: "International",
    competitions: [{ name: "FIFA World Cup 2026", fallbackMatchCount: 0 }],
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
    ],
  },
  {
    title: "America",
    competitions: [
      { name: "Copa Libertadores", fallbackMatchCount: 0 },
      { name: "Copa Sudamericana", fallbackMatchCount: 0 },
      { name: "MLS", fallbackMatchCount: 0 },
      { name: "Brasileirao", fallbackMatchCount: 0 },
      { name: "Liga Profesional Argentina", fallbackMatchCount: 0 },
    ],
  },
];

const competitionPriority = new Map<string, number>();

sidebarSections.forEach((section, sectionIndex) => {
  section.competitions.forEach((competition, competitionIndex) => {
    if (!competitionPriority.has(competition.name)) {
      competitionPriority.set(competition.name, sectionIndex * 100 + competitionIndex);
    }
  });
});

export function getCompetitionSortPriority(competitionName: string) {
  return competitionPriority.get(competitionName) ?? Number.MAX_SAFE_INTEGER;
}
