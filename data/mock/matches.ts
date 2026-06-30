import { formatDateKey } from "@/lib/match-date";
import type { Match, Team } from "@/types/match";

const countryFlagFiles: Record<string, string> = {
  dz: "algeria",
  ar: "argentina",
  au: "australia",
  at: "austria",
  be: "belgium",
  br: "brazil",
  ca: "canada",
  cl: "chile",
  co: "colombia",
  hr: "croatia",
  eg: "egypt",
  "gb-eng": "england",
  fr: "france",
  de: "germany",
  gh: "ghana",
  ci: "ivory-coast",
  it: "italy",
  jp: "japan",
  jo: "jordan",
  kr: "korea-republic",
  mx: "mexico",
  ma: "morocco",
  nl: "netherlands",
  no: "norway",
  pt: "portugal",
  qa: "qatar",
  "gb-sct": "scotland",
  sn: "senegal",
  za: "south-africa",
  es: "spain",
  ch: "switzerland",
  us: "usa",
  uy: "uruguay",
  "gb-wls": "wales",
};

const flagUrl = (countryCode: string) => `/flags/${countryFlagFiles[countryCode]}.svg`;
const nationalTeam = (id: string, name: string, countryCode: string): Team => ({
  id,
  name,
  countryCode,
  crestUrl: flagUrl(countryCode),
});

const teams = {
  mexico: nationalTeam("mexico", "Mexico", "mx"),
  southAfrica: nationalTeam("south-africa", "South Africa", "za"),
  canada: nationalTeam("canada", "Canada", "ca"),
  qatar: nationalTeam("qatar", "Qatar", "qa"),
  usa: nationalTeam("usa", "United States", "us"),
  morocco: nationalTeam("morocco", "Morocco", "ma"),
  brazil: nationalTeam("brazil", "Brazil", "br"),
  scotland: nationalTeam("scotland", "Scotland", "gb-sct"),
  germany: nationalTeam("germany", "Germany", "de"),
  japan: nationalTeam("japan", "Japan", "jp"),
  italy: nationalTeam("italy", "Italy", "it"),
  senegal: nationalTeam("senegal", "Senegal", "sn"),
  spain: nationalTeam("spain", "Spain", "es"),
  norway: nationalTeam("norway", "Norway", "no"),
  france: nationalTeam("france", "France", "fr"),
  koreaRepublic: nationalTeam("korea-republic", "Korea Republic", "kr"),
  england: nationalTeam("england", "England", "gb-eng"),
  ghana: nationalTeam("ghana", "Ghana", "gh"),
  netherlands: nationalTeam("netherlands", "Netherlands", "nl"),
  chile: nationalTeam("chile", "Chile", "cl"),
  portugal: nationalTeam("portugal", "Portugal", "pt"),
  egypt: nationalTeam("egypt", "Egypt", "eg"),
  belgium: nationalTeam("belgium", "Belgium", "be"),
  australia: nationalTeam("australia", "Australia", "au"),
  argentina: nationalTeam("argentina", "Argentina", "ar"),
  algeria: nationalTeam("algeria", "Algeria", "dz"),
  austria: nationalTeam("austria", "Austria", "at"),
  jordan: nationalTeam("jordan", "Jordan", "jo"),
  uruguay: nationalTeam("uruguay", "Uruguay", "uy"),
  ivoryCoast: nationalTeam("ivory-coast", "Ivory Coast", "ci"),
  colombia: nationalTeam("colombia", "Colombia", "co"),
  switzerland: nationalTeam("switzerland", "Switzerland", "ch"),
  croatia: nationalTeam("croatia", "Croatia", "hr"),
  wales: nationalTeam("wales", "Wales", "gb-wls"),
} satisfies Record<string, Team>;

export function formatMatchDate(date: Date): string {
  return formatDateKey(date);
}


export function createMockMatches(date: Date = new Date()): Match[] {
  const matchDate = formatMatchDate(date);
  const worldCupMatch = (match: Omit<Match, "competition" | "apiFootball">, group: string): Match => ({
    ...match,
    competition: "FIFA World Cup",
    stage: group,
    group,
    apiFootball: {
      fixtureId: Math.abs([...match.id].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) % 1_000_000_000, 7)),
      leagueId: 1,
      leagueName: "FIFA World Cup",
      season: Number(matchDate.slice(0, 4)),
      round: group,
    },
  });

  return [
    worldCupMatch({ id: `argentina-algeria-${matchDate}`, homeTeam: teams.argentina, awayTeam: teams.algeria, kickoffTime: "13:00", venue: "MetLife Stadium", date: matchDate, status: "finished", score: { home: 2, away: 0 } }, "Group J"),
    worldCupMatch({ id: `argentina-austria-${matchDate}`, homeTeam: teams.argentina, awayTeam: teams.austria, kickoffTime: "18:00", venue: "Arrowhead Stadium", date: matchDate, status: "live", score: { home: 1, away: 1 } }, "Group J"),
    worldCupMatch({ id: `jordan-argentina-${matchDate}`, homeTeam: teams.jordan, awayTeam: teams.argentina, kickoffTime: "21:00", venue: "Hard Rock Stadium", date: matchDate, status: "scheduled" }, "Group J"),
    worldCupMatch({ id: `mexico-south-africa-${matchDate}`, homeTeam: teams.mexico, awayTeam: teams.southAfrica, kickoffTime: "12:00", venue: "Estadio Azteca", date: matchDate, status: "finished", score: { home: 1, away: 1 } }, "Group A"),
    worldCupMatch({ id: `canada-qatar-${matchDate}`, homeTeam: teams.canada, awayTeam: teams.qatar, kickoffTime: "14:00", venue: "BMO Field", date: matchDate, status: "scheduled" }, "Group B"),
    worldCupMatch({ id: `usa-morocco-${matchDate}`, homeTeam: teams.usa, awayTeam: teams.morocco, kickoffTime: "16:00", venue: "SoFi Stadium", date: matchDate, status: "live", score: { home: 0, away: 0 } }, "Group C"),
    worldCupMatch({ id: `brazil-scotland-${matchDate}`, homeTeam: teams.brazil, awayTeam: teams.scotland, kickoffTime: "17:30", venue: "AT&T Stadium", date: matchDate, status: "scheduled" }, "Group D"),
    worldCupMatch({ id: `germany-japan-${matchDate}`, homeTeam: teams.germany, awayTeam: teams.japan, kickoffTime: "19:00", venue: "Lincoln Financial Field", date: matchDate, status: "finished", score: { home: 2, away: 2 } }, "Group E"),
    worldCupMatch({ id: `italy-senegal-${matchDate}`, homeTeam: teams.italy, awayTeam: teams.senegal, kickoffTime: "20:30", venue: "Lumen Field", date: matchDate, status: "scheduled" }, "Group F"),
    worldCupMatch({ id: `spain-norway-${matchDate}`, homeTeam: teams.spain, awayTeam: teams.norway, kickoffTime: "15:30", venue: "BC Place", date: matchDate, status: "finished", score: { home: 3, away: 1 } }, "Group G"),
    worldCupMatch({ id: `france-korea-republic-${matchDate}`, homeTeam: teams.france, awayTeam: teams.koreaRepublic, kickoffTime: "22:00", venue: "Mercedes-Benz Stadium", date: matchDate, status: "scheduled" }, "Group H"),
    worldCupMatch({ id: `england-ghana-${matchDate}`, homeTeam: teams.england, awayTeam: teams.ghana, kickoffTime: "11:00", venue: "Gillette Stadium", date: matchDate, status: "finished", score: { home: 2, away: 1 } }, "Group I"),
    worldCupMatch({ id: `netherlands-chile-${matchDate}`, homeTeam: teams.netherlands, awayTeam: teams.chile, kickoffTime: "18:45", venue: "Levi's Stadium", date: matchDate, status: "live", score: { home: 1, away: 0 } }, "Group K"),
    worldCupMatch({ id: `portugal-egypt-${matchDate}`, homeTeam: teams.portugal, awayTeam: teams.egypt, kickoffTime: "23:00", venue: "NRG Stadium", date: matchDate, status: "scheduled" }, "Group L"),
  ];
}

export const mockMatches: Match[] = createMockMatches();
