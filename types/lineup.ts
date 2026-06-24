export type LineupTeam = "home" | "away";

export type LineupPlayer = {
  id: string;
  name: string;
  position: string;
  number: number;
};

export type TeamLineup = {
  team: LineupTeam;
  formation: string;
  startingEleven: LineupPlayer[];
};

export type MatchLineup = {
  matchId: string;
  home: TeamLineup;
  away: TeamLineup;
};
