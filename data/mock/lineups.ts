import type { MatchLineup } from "@/types/lineup";

const matchLineupFixtures: Record<string, MatchLineup> = {
  "boca-racing": {
    matchId: "boca-racing",
    home: {
      team: "home",
      formation: "4-3-1-2",
      startingEleven: [
        { id: "romero", name: "Sergio Romero", position: "ARQ", number: 1 },
        { id: "advincula", name: "Luis Advíncula", position: "DEF", number: 17 },
        { id: "lema", name: "Cristian Lema", position: "DEF", number: 2 },
        { id: "rojo", name: "Marcos Rojo", position: "DEF", number: 6 },
        { id: "blanco", name: "Lautaro Blanco", position: "DEF", number: 23 },
        { id: "medina", name: "Cristian Medina", position: "MED", number: 36 },
        { id: "fernandez", name: "Ezequiel Fernández", position: "MED", number: 21 },
        { id: "zenon", name: "Kevin Zenón", position: "MED", number: 22 },
        { id: "taborda", name: "Vicente Taborda", position: "ENG", number: 20 },
        { id: "cavani", name: "Edinson Cavani", position: "DEL", number: 10 },
        { id: "merentiel", name: "Miguel Merentiel", position: "DEL", number: 16 },
      ],
    },
    away: {
      team: "away",
      formation: "4-2-3-1",
      startingEleven: [
        { id: "arias", name: "Gabriel Arias", position: "ARQ", number: 21 },
        { id: "mura", name: "Facundo Mura", position: "DEF", number: 34 },
        { id: "conti", name: "Germán Conti", position: "DEF", number: 2 },
        { id: "di-cesare", name: "Marco Di Cesare", position: "DEF", number: 3 },
        { id: "rojas", name: "Gabriel Rojas", position: "DEF", number: 27 },
        { id: "sosa", name: "Santiago Sosa", position: "MED", number: 13 },
        { id: "almendra", name: "Agustín Almendra", position: "MED", number: 32 },
        { id: "solari", name: "Santiago Solari", position: "VOL", number: 28 },
        { id: "quintero", name: "Juan Fernando Quintero", position: "VOL", number: 8 },
        { id: "salas", name: "Maximiliano Salas", position: "VOL", number: 7 },
        { id: "martinez", name: "Adrián Martínez", position: "DEL", number: 9 },
      ],
    },
  },
  "river-independiente": {
    matchId: "river-independiente",
    home: {
      team: "home",
      formation: "4-3-3",
      startingEleven: [
        { id: "armani", name: "Franco Armani", position: "ARQ", number: 1 },
        { id: "herrera", name: "Andrés Herrera", position: "DEF", number: 15 },
        { id: "paulo-diaz", name: "Paulo Díaz", position: "DEF", number: 17 },
        { id: "gonzalez-pirez", name: "Leandro González Pirez", position: "DEF", number: 14 },
        { id: "casco", name: "Milton Casco", position: "DEF", number: 20 },
        { id: "villagra", name: "Rodrigo Villagra", position: "MED", number: 23 },
        { id: "aliendro", name: "Rodrigo Aliendro", position: "MED", number: 29 },
        { id: "echeverri", name: "Claudio Echeverri", position: "MED", number: 19 },
        { id: "solari-river", name: "Pablo Solari", position: "DEL", number: 36 },
        { id: "borja", name: "Miguel Borja", position: "DEL", number: 9 },
        { id: "colidio", name: "Facundo Colidio", position: "DEL", number: 11 },
      ],
    },
    away: {
      team: "away",
      formation: "4-4-2",
      startingEleven: [
        { id: "rey", name: "Rodrigo Rey", position: "ARQ", number: 33 },
        { id: "isla", name: "Mauricio Isla", position: "DEF", number: 4 },
        { id: "laso", name: "Joaquín Laso", position: "DEF", number: 2 },
        { id: "costa", name: "Ayrton Costa", position: "DEF", number: 79 },
        { id: "sporon", name: "Damián Pérez", position: "DEF", number: 15 },
        { id: "marcone", name: "Iván Marcone", position: "MED", number: 23 },
        { id: "mancuello", name: "Federico Mancuello", position: "MED", number: 11 },
        { id: "montiel", name: "Santiago Montiel", position: "MED", number: 7 },
        { id: "lopez", name: "Santiago López", position: "MED", number: 24 },
        { id: "avalos", name: "Gabriel Ávalos", position: "DEL", number: 9 },
        { id: "canelo", name: "Alexis Canelo", position: "DEL", number: 32 },
      ],
    },
  },
};

function getFixtureKey(matchId: string): string {
  return (
    Object.keys(matchLineupFixtures).find((fixtureKey) => matchId.startsWith(fixtureKey)) ??
    matchId
  );
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
