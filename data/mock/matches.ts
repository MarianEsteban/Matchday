import type { Match, Team } from "@/types/match";

const teams = {
  bocaJuniors: {
    id: "boca-juniors",
    name: "Boca Juniors",
    crestUrl: "/crests/boca-juniors.svg",
  },
  racingClub: {
    id: "racing-club",
    name: "Racing Club",
    crestUrl: "/crests/racing-club.svg",
  },
  riverPlate: {
    id: "river-plate",
    name: "River Plate",
    crestUrl: "/crests/river-plate.svg",
  },
  independiente: {
    id: "independiente",
    name: "Independiente",
    crestUrl: "/crests/independiente.svg",
  },
  sanLorenzo: {
    id: "san-lorenzo",
    name: "San Lorenzo",
    crestUrl: "/crests/san-lorenzo.svg",
  },
  huracan: { id: "huracan", name: "Huracán", crestUrl: "/crests/huracan.svg" },
  estudiantes: { id: "estudiantes", name: "Estudiantes", crestUrl: "/crests/estudiantes.svg" },
  gimnasia: {
    id: "gimnasia-y-esgrima-la-plata",
    name: "Gimnasia y Esgrima La Plata",
    crestUrl: "/crests/gimnasia-y-esgrima-la-plata.svg",
  },
} satisfies Record<string, Team>;

export function formatMatchDate(date: Date): string {
  const wasParsedFromDateOnlyIso =
    date.getUTCHours() === 0 &&
    date.getUTCMinutes() === 0 &&
    date.getUTCSeconds() === 0 &&
    date.getUTCMilliseconds() === 0;

  if (wasParsedFromDateOnlyIso) {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function createMockMatches(date: Date = new Date()): Match[] {
  const matchDate = formatMatchDate(date);

  return [
    {
      id: `boca-racing-${matchDate}`,
      homeTeam: teams.bocaJuniors,
      awayTeam: teams.racingClub,
      competition: "Liga Profesional Argentina",
      kickoffTime: "18:30",
      venue: "La Bombonera",
      date: matchDate,
      status: "live",
      score: { home: 1, away: 1 },
    },
    {
      id: `river-independiente-${matchDate}`,
      homeTeam: teams.riverPlate,
      awayTeam: teams.independiente,
      competition: "Liga Profesional Argentina",
      kickoffTime: "20:00",
      venue: "Mâs Monumental",
      date: matchDate,
      status: "finished",
      score: { home: 2, away: 0 },
    },
    {
      id: `san-lorenzo-huracan-${matchDate}`,
      homeTeam: teams.sanLorenzo,
      awayTeam: teams.huracan,
      competition: "Clásico Porteño",
      kickoffTime: "21:15",
      venue: "Pedro Bidegain",
      date: matchDate,
      status: "scheduled",
    },
    {
      id: `estudiantes-gimnasia-${matchDate}`,
      homeTeam: teams.estudiantes,
      awayTeam: teams.gimnasia,
      competition: "Clásico Platense",
      kickoffTime: "22:00",
      venue: "Jorge Luis Hirschi",
      date: matchDate,
      status: "scheduled",
    },
  ];
}

export const mockMatches: Match[] = createMockMatches();
