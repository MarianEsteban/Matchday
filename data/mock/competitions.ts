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
    title: "Destacadas",
    competitions: [
      { name: "Liga Profesional Argentina", fallbackMatchCount: 6 },
      { name: "Copa Libertadores", fallbackMatchCount: 4 },
      { name: "UEFA Champions League", fallbackMatchCount: 8 },
    ],
  },
  {
    title: "Argentina",
    competitions: [
      { name: "Clásico Porteño", fallbackMatchCount: 1 },
      { name: "Clásico Platense", fallbackMatchCount: 1 },
      { name: "Primera Nacional", fallbackMatchCount: 7 },
      { name: "Copa Argentina", fallbackMatchCount: 3 },
    ],
  },
  {
    title: "Internacional",
    competitions: [
      { name: "Premier League", fallbackMatchCount: 5 },
      { name: "LaLiga", fallbackMatchCount: 4 },
      { name: "Serie A", fallbackMatchCount: 6 },
      { name: "Copa Sudamericana", fallbackMatchCount: 2 },
    ],
  },
];
