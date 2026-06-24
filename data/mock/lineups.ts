import type { MatchLineup } from "@/types/lineup";

const argentina = [
  { id: "martinez", name: "Emiliano Martínez", position: "ARQ", number: 23 },
  { id: "molina", name: "Nahuel Molina", position: "DEF", number: 2 },
  { id: "romero", name: "Cristian Romero", position: "DEF", number: 13 },
  { id: "otamendi", name: "Nicolás Otamendi", position: "DEF", number: 19 },
  { id: "tagliafico", name: "Nicolás Tagliafico", position: "DEF", number: 3 },
  { id: "de-paul", name: "Rodrigo De Paul", position: "MED", number: 7 },
  { id: "fernandez", name: "Enzo Fernández", position: "MED", number: 24 },
  { id: "mac-allister", name: "Alexis Mac Allister", position: "MED", number: 20 },
  { id: "di-maria", name: "Ángel Di María", position: "DEL", number: 11 },
  { id: "messi", name: "Lionel Messi", position: "DEL", number: 10 },
  { id: "alvarez", name: "Julián Álvarez", position: "DEL", number: 9 },
];

const algeria = ["Mandrea", "Atal", "Mandi", "Bensebaini", "Aït-Nouri", "Bennacer", "Zerrouki", "Chaïbi", "Mahrez", "Gouiri", "Bounedjah"].map((name, index) => ({ id: `algeria-${index}`, name, position: index === 0 ? "ARQ" : index < 5 ? "DEF" : index < 8 ? "MED" : "DEL", number: index + 1 }));
const austria = ["Pentz", "Posch", "Lienhart", "Alaba", "Mwene", "Seiwald", "Laimer", "Sabitzer", "Baumgartner", "Arnautović", "Gregoritsch"].map((name, index) => ({ id: `austria-${index}`, name, position: index === 0 ? "ARQ" : index < 5 ? "DEF" : index < 8 ? "MED" : "DEL", number: index + 1 }));
const jordan = ["Abu Layla", "Naseeb", "Al Arab", "Mardi", "Haddad", "Al Taamari", "Ayed", "Al Rawabdeh", "Olwan", "Al Naimat", "Mousa"].map((name, index) => ({ id: `jordan-${index}`, name, position: index === 0 ? "ARQ" : index < 5 ? "DEF" : index < 8 ? "MED" : "DEL", number: index + 1 }));

const matchLineupFixtures: Record<string, MatchLineup> = {
  "argentina-algeria": {
    matchId: "argentina-algeria",
    home: { team: "home", formation: "4-3-3", startingEleven: argentina },
    away: { team: "away", formation: "4-2-3-1", startingEleven: algeria },
  },
  "argentina-austria": {
    matchId: "argentina-austria",
    home: { team: "home", formation: "4-3-3", startingEleven: argentina },
    away: { team: "away", formation: "4-2-3-1", startingEleven: austria },
  },
  "jordan-argentina": {
    matchId: "jordan-argentina",
    home: { team: "home", formation: "5-4-1", startingEleven: jordan },
    away: { team: "away", formation: "4-3-3", startingEleven: argentina },
  },
};

function getFixtureKey(matchId: string): string {
  return Object.keys(matchLineupFixtures).find((fixtureKey) => matchId.startsWith(fixtureKey)) ?? matchId;
}

export function getLineupsByMatchId(matchId: string): MatchLineup | undefined {
  const fixtureKey = getFixtureKey(matchId);
  const lineup = matchLineupFixtures[fixtureKey];

  if (!lineup) {
    return undefined;
  }

  return {
    matchId,
    home: lineup.home,
    away: lineup.away,
  };
}
