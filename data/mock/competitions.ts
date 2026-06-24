export type SidebarCompetition = {
  name: string;
  fallbackMatchCount: number;
};

export type SidebarSection = {
  title: string;
  competitions: SidebarCompetition[];
};

const groupCompetitions: SidebarCompetition[] = Array.from({ length: 12 }, (_, index) => ({
  name: `Group ${String.fromCharCode(65 + index)}`,
  fallbackMatchCount: index === 9 ? 3 : 1,
}));

export const sidebarSections: SidebarSection[] = [
  {
    title: "Today",
    competitions: [
      { name: "Group J", fallbackMatchCount: 3 },
      { name: "Group C", fallbackMatchCount: 1 },
      { name: "Group K", fallbackMatchCount: 1 },
    ],
  },
  {
    title: "Argentina",
    competitions: [{ name: "Group J", fallbackMatchCount: 3 }],
  },
  {
    title: "Groups",
    competitions: groupCompetitions,
  },
  {
    title: "Knockout Stage",
    competitions: [
      { name: "Round of 32", fallbackMatchCount: 16 },
      { name: "Round of 16", fallbackMatchCount: 8 },
      { name: "Quarterfinals", fallbackMatchCount: 4 },
      { name: "Semifinals", fallbackMatchCount: 2 },
      { name: "Final", fallbackMatchCount: 1 },
    ],
  },
];
