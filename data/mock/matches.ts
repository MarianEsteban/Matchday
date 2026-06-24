import type { Match, Team } from "@/types/match";

const flagUrl = (teamId: string) => `/flags/${teamId}.svg`;

const teams = {
  mexico: { id: "mexico", name: "Mexico", crestUrl: flagUrl("mexico") },
  southAfrica: { id: "south-africa", name: "South Africa", crestUrl: flagUrl("south-africa") },
  canada: { id: "canada", name: "Canada", crestUrl: flagUrl("canada") },
  qatar: { id: "qatar", name: "Qatar", crestUrl: flagUrl("qatar") },
  usa: { id: "usa", name: "United States", crestUrl: flagUrl("usa") },
  morocco: { id: "morocco", name: "Morocco", crestUrl: flagUrl("morocco") },
  brazil: { id: "brazil", name: "Brazil", crestUrl: flagUrl("brazil") },
  scotland: { id: "scotland", name: "Scotland", crestUrl: flagUrl("scotland") },
  germany: { id: "germany", name: "Germany", crestUrl: flagUrl("germany") },
  japan: { id: "japan", name: "Japan", crestUrl: flagUrl("japan") },
  italy: { id: "italy", name: "Italy", crestUrl: flagUrl("italy") },
  senegal: { id: "senegal", name: "Senegal", crestUrl: flagUrl("senegal") },
  spain: { id: "spain", name: "Spain", crestUrl: flagUrl("spain") },
  norway: { id: "norway", name: "Norway", crestUrl: flagUrl("norway") },
  france: { id: "france", name: "France", crestUrl: flagUrl("france") },
  koreaRepublic: { id: "korea-republic", name: "Korea Republic", crestUrl: flagUrl("korea-republic") },
  england: { id: "england", name: "England", crestUrl: flagUrl("england") },
  ghana: { id: "ghana", name: "Ghana", crestUrl: flagUrl("ghana") },
  netherlands: { id: "netherlands", name: "Netherlands", crestUrl: flagUrl("netherlands") },
  chile: { id: "chile", name: "Chile", crestUrl: flagUrl("chile") },
  portugal: { id: "portugal", name: "Portugal", crestUrl: flagUrl("portugal") },
  egypt: { id: "egypt", name: "Egypt", crestUrl: flagUrl("egypt") },
  belgium: { id: "belgium", name: "Belgium", crestUrl: flagUrl("belgium") },
  australia: { id: "australia", name: "Australia", crestUrl: flagUrl("australia") },
  argentina: { id: "argentina", name: "Argentina", crestUrl: flagUrl("argentina") },
  algeria: { id: "algeria", name: "Algeria", crestUrl: flagUrl("algeria") },
  austria: { id: "austria", name: "Austria", crestUrl: flagUrl("austria") },
  jordan: { id: "jordan", name: "Jordan", crestUrl: flagUrl("jordan") },
  uruguay: { id: "uruguay", name: "Uruguay", crestUrl: flagUrl("uruguay") },
  ivoryCoast: { id: "ivory-coast", name: "Ivory Coast", crestUrl: flagUrl("ivory-coast") },
  colombia: { id: "colombia", name: "Colombia", crestUrl: flagUrl("colombia") },
  switzerland: { id: "switzerland", name: "Switzerland", crestUrl: flagUrl("switzerland") },
  croatia: { id: "croatia", name: "Croatia", crestUrl: flagUrl("croatia") },
  wales: { id: "wales", name: "Wales", crestUrl: flagUrl("wales") },
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
    { id: `argentina-algeria-${matchDate}`, homeTeam: teams.argentina, awayTeam: teams.algeria, competition: "Group J", kickoffTime: "13:00", venue: "MetLife Stadium", date: matchDate, status: "finished", score: { home: 2, away: 0 } },
    { id: `argentina-austria-${matchDate}`, homeTeam: teams.argentina, awayTeam: teams.austria, competition: "Group J", kickoffTime: "18:00", venue: "Arrowhead Stadium", date: matchDate, status: "live", score: { home: 1, away: 1 } },
    { id: `jordan-argentina-${matchDate}`, homeTeam: teams.jordan, awayTeam: teams.argentina, competition: "Group J", kickoffTime: "21:00", venue: "Hard Rock Stadium", date: matchDate, status: "scheduled" },
    { id: `mexico-south-africa-${matchDate}`, homeTeam: teams.mexico, awayTeam: teams.southAfrica, competition: "Group A", kickoffTime: "12:00", venue: "Estadio Azteca", date: matchDate, status: "finished", score: { home: 1, away: 1 } },
    { id: `canada-qatar-${matchDate}`, homeTeam: teams.canada, awayTeam: teams.qatar, competition: "Group B", kickoffTime: "14:00", venue: "BMO Field", date: matchDate, status: "scheduled" },
    { id: `usa-morocco-${matchDate}`, homeTeam: teams.usa, awayTeam: teams.morocco, competition: "Group C", kickoffTime: "16:00", venue: "SoFi Stadium", date: matchDate, status: "live", score: { home: 0, away: 0 } },
    { id: `brazil-scotland-${matchDate}`, homeTeam: teams.brazil, awayTeam: teams.scotland, competition: "Group D", kickoffTime: "17:30", venue: "AT&T Stadium", date: matchDate, status: "scheduled" },
    { id: `germany-japan-${matchDate}`, homeTeam: teams.germany, awayTeam: teams.japan, competition: "Group E", kickoffTime: "19:00", venue: "Lincoln Financial Field", date: matchDate, status: "finished", score: { home: 2, away: 2 } },
    { id: `italy-senegal-${matchDate}`, homeTeam: teams.italy, awayTeam: teams.senegal, competition: "Group F", kickoffTime: "20:30", venue: "Lumen Field", date: matchDate, status: "scheduled" },
    { id: `spain-norway-${matchDate}`, homeTeam: teams.spain, awayTeam: teams.norway, competition: "Group G", kickoffTime: "15:30", venue: "BC Place", date: matchDate, status: "finished", score: { home: 3, away: 1 } },
    { id: `france-korea-republic-${matchDate}`, homeTeam: teams.france, awayTeam: teams.koreaRepublic, competition: "Group H", kickoffTime: "22:00", venue: "Mercedes-Benz Stadium", date: matchDate, status: "scheduled" },
    { id: `england-ghana-${matchDate}`, homeTeam: teams.england, awayTeam: teams.ghana, competition: "Group I", kickoffTime: "11:00", venue: "Gillette Stadium", date: matchDate, status: "finished", score: { home: 2, away: 1 } },
    { id: `netherlands-chile-${matchDate}`, homeTeam: teams.netherlands, awayTeam: teams.chile, competition: "Group K", kickoffTime: "18:45", venue: "Levi's Stadium", date: matchDate, status: "live", score: { home: 1, away: 0 } },
    { id: `portugal-egypt-${matchDate}`, homeTeam: teams.portugal, awayTeam: teams.egypt, competition: "Group L", kickoffTime: "23:00", venue: "NRG Stadium", date: matchDate, status: "scheduled" },
  ];
}

export const mockMatches: Match[] = createMockMatches();
