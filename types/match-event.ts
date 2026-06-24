export type MatchEventType = "goal" | "yellow-card" | "red-card" | "substitution";

export type MatchEventTeam = "home" | "away";

type BaseMatchEvent = {
  id: string;
  matchId: string;
  minute: number;
  team: MatchEventTeam;
  playerName: string;
};

export type GoalMatchEvent = BaseMatchEvent & {
  type: "goal";
  assistName?: string;
};

export type CardMatchEvent = BaseMatchEvent & {
  type: "yellow-card" | "red-card";
  reason?: string;
};

export type SubstitutionMatchEvent = BaseMatchEvent & {
  type: "substitution";
  playerInName: string;
  playerOutName: string;
};

export type MatchEvent = GoalMatchEvent | CardMatchEvent | SubstitutionMatchEvent;
