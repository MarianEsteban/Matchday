import type { CompetitionStandings } from "@/types/standing";

type TeamStandingSeed = {
  teamId: string;
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
};

const groups: Record<string, TeamStandingSeed[]> = {
  "Group A": [
    { teamId: "mexico", teamName: "Mexico", played: 1, won: 0, drawn: 1, lost: 0, goalsFor: 1, goalsAgainst: 1 },
    { teamId: "south-africa", teamName: "South Africa", played: 1, won: 0, drawn: 1, lost: 0, goalsFor: 1, goalsAgainst: 1 },
    { teamId: "uruguay", teamName: "Uruguay", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0 },
    { teamId: "switzerland", teamName: "Switzerland", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0 },
  ],
  "Group B": ["Canada", "Qatar", "Colombia", "Wales"].map((teamName) => ({ teamId: teamName.toLowerCase().replaceAll(" ", "-"), teamName, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0 })),
  "Group C": ["United States", "Morocco", "Croatia", "Australia"].map((teamName) => ({ teamId: teamName === "United States" ? "usa" : teamName.toLowerCase().replaceAll(" ", "-"), teamName, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0 })),
  "Group D": ["Brazil", "Scotland", "Ivory Coast", "Belgium"].map((teamName) => ({ teamId: teamName.toLowerCase().replaceAll(" ", "-"), teamName, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0 })),
  "Group E": [
    { teamId: "germany", teamName: "Germany", played: 1, won: 0, drawn: 1, lost: 0, goalsFor: 2, goalsAgainst: 2 },
    { teamId: "japan", teamName: "Japan", played: 1, won: 0, drawn: 1, lost: 0, goalsFor: 2, goalsAgainst: 2 },
    { teamId: "chile", teamName: "Chile", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0 },
    { teamId: "australia", teamName: "Australia", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0 },
  ],
  "Group F": ["Italy", "Senegal", "Egypt", "Norway"].map((teamName) => ({ teamId: teamName.toLowerCase().replaceAll(" ", "-"), teamName, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0 })),
  "Group G": [
    { teamId: "spain", teamName: "Spain", played: 1, won: 1, drawn: 0, lost: 0, goalsFor: 3, goalsAgainst: 1 },
    { teamId: "netherlands", teamName: "Netherlands", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0 },
    { teamId: "ghana", teamName: "Ghana", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0 },
    { teamId: "norway", teamName: "Norway", played: 1, won: 0, drawn: 0, lost: 1, goalsFor: 1, goalsAgainst: 3 },
  ],
  "Group H": ["France", "Korea Republic", "Portugal", "Algeria"].map((teamName) => ({ teamId: teamName.toLowerCase().replaceAll(" ", "-"), teamName, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0 })),
  "Group I": [
    { teamId: "england", teamName: "England", played: 1, won: 1, drawn: 0, lost: 0, goalsFor: 2, goalsAgainst: 1 },
    { teamId: "croatia", teamName: "Croatia", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0 },
    { teamId: "jordan", teamName: "Jordan", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0 },
    { teamId: "ghana", teamName: "Ghana", played: 1, won: 0, drawn: 0, lost: 1, goalsFor: 1, goalsAgainst: 2 },
  ],
  "Group J": [
    { teamId: "argentina", teamName: "Argentina", played: 2, won: 1, drawn: 1, lost: 0, goalsFor: 3, goalsAgainst: 1 },
    { teamId: "austria", teamName: "Austria", played: 1, won: 0, drawn: 1, lost: 0, goalsFor: 1, goalsAgainst: 1 },
    { teamId: "jordan", teamName: "Jordan", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0 },
    { teamId: "algeria", teamName: "Algeria", played: 1, won: 0, drawn: 0, lost: 1, goalsFor: 0, goalsAgainst: 2 },
  ],
  "Group K": [
    { teamId: "netherlands", teamName: "Netherlands", played: 1, won: 1, drawn: 0, lost: 0, goalsFor: 1, goalsAgainst: 0 },
    { teamId: "uruguay", teamName: "Uruguay", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0 },
    { teamId: "ivory-coast", teamName: "Ivory Coast", played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0 },
    { teamId: "chile", teamName: "Chile", played: 1, won: 0, drawn: 0, lost: 1, goalsFor: 0, goalsAgainst: 1 },
  ],
  "Group L": ["Portugal", "Egypt", "Belgium", "Australia"].map((teamName) => ({ teamId: teamName.toLowerCase().replaceAll(" ", "-"), teamName, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0 })),
};

export const mockStandings: CompetitionStandings[] = Object.entries(groups).map(
  ([competition, rows]) => ({
    competition,
    rows: rows
      .map((row) => ({
        ...row,
        goalDifference: row.goalsFor - row.goalsAgainst,
        points: row.won * 3 + row.drawn,
      }))
      .sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor)
      .map((row, index) => ({ ...row, position: index + 1 })),
  }),
);

export function getStandingsByCompetition(competition: string): CompetitionStandings | undefined {
  return mockStandings.find((standing) => standing.competition === competition);
}
