import type { Match } from "@/types/match";

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
      homeTeam: "Boca Juniors",
      awayTeam: "Racing Club",
      competition: "Liga Profesional Argentina",
      kickoffTime: "18:30",
      venue: "La Bombonera",
      date: matchDate,
      status: "scheduled",
    },
    {
      id: `river-independiente-${matchDate}`,
      homeTeam: "River Plate",
      awayTeam: "Independiente",
      competition: "Liga Profesional Argentina",
      kickoffTime: "20:00",
      venue: "Mâs Monumental",
      date: matchDate,
      status: "scheduled",
    },
    {
      id: `san-lorenzo-huracan-${matchDate}`,
      homeTeam: "San Lorenzo",
      awayTeam: "Huracán",
      competition: "Clásico Porteño",
      kickoffTime: "21:15",
      venue: "Pedro Bidegain",
      date: matchDate,
      status: "scheduled",
    },
    {
      id: `estudiantes-gimnasia-${matchDate}`,
      homeTeam: "Estudiantes",
      awayTeam: "Gimnasia y Esgrima La Plata",
      competition: "Clásico Platense",
      kickoffTime: "22:00",
      venue: "Jorge Luis Hirschi",
      date: matchDate,
      status: "scheduled",
    },
  ];
}

export const mockMatches: Match[] = createMockMatches();
