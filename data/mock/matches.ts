import type { Match } from "@/types/match";

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const today = formatLocalDate(new Date());

export const mockMatches: Match[] = [
  {
    id: `boca-racing-${today}`,
    homeTeam: "Boca Juniors",
    awayTeam: "Racing Club",
    competition: "Liga Profesional Argentina",
    kickoffTime: "18:30",
    venue: "La Bombonera",
    date: today,
    status: "scheduled",
  },
  {
    id: `river-independiente-${today}`,
    homeTeam: "River Plate",
    awayTeam: "Independiente",
    competition: "Liga Profesional Argentina",
    kickoffTime: "20:00",
    venue: "Mâs Monumental",
    date: today,
    status: "scheduled",
  },
  {
    id: `san-lorenzo-huracan-${today}`,
    homeTeam: "San Lorenzo",
    awayTeam: "Huracán",
    competition: "Clásico Porteño",
    kickoffTime: "21:15",
    venue: "Pedro Bidegain",
    date: today,
    status: "scheduled",
  },
  {
    id: `estudiantes-gimnasia-${today}`,
    homeTeam: "Estudiantes",
    awayTeam: "Gimnasia y Esgrima La Plata",
    competition: "Clásico Platense",
    kickoffTime: "22:00",
    venue: "Jorge Luis Hirschi",
    date: today,
    status: "scheduled",
  },
];
