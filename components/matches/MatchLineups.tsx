import { Trans } from "@/components/ui/AppPreferences";
import { TeamName } from "@/components/ui/TeamName";
import type { LineupPlayer, MatchLineup, TeamLineup } from "@/types/lineup";
import type { Match, MatchListDataSource } from "@/types/match";

type MatchLineupsProps = {
  lineup?: MatchLineup;
  match: Match;
  dataSource?: MatchListDataSource;
};

const positionOrder = ["G", "GK", "ARQ", "DEF", "D", "M", "MID", "MED", "F", "FW", "DEL"];

function splitFormation(formation: string) {
  return formation.split("-").map((part) => Number(part)).filter((part) => Number.isFinite(part) && part > 0);
}

function chunkOutfieldPlayers(players: LineupPlayer[], formation: string) {
  const goalkeeper = players[0];
  const outfield = players.slice(1);
  const lines = splitFormation(formation);
  if (lines.reduce((sum, line) => sum + line, 0) !== outfield.length) {
    return [goalkeeper ? [goalkeeper] : [], ...["DEF", "MED", "DEL"].map((position) => outfield.filter((player) => player.position.toUpperCase().includes(position)))].filter((line) => line.length > 0);
  }

  const rows = goalkeeper ? [[goalkeeper]] : [];
  let cursor = 0;
  for (const line of lines) {
    rows.push(outfield.slice(cursor, cursor + line));
    cursor += line;
  }
  return rows;
}

function groupedPlayers(players: LineupPlayer[]) {
  return [...players].sort((a, b) => {
    const aIndex = positionOrder.findIndex((position) => a.position.toUpperCase().includes(position));
    const bIndex = positionOrder.findIndex((position) => b.position.toUpperCase().includes(position));
    return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
  });
}

function PlayerChip({ player }: { player: LineupPlayer }) {
  return (
    <span className="flex min-w-0 items-center gap-1.5 rounded-full border border-white/15 bg-zinc-950/70 px-2 py-1 text-[0.62rem] font-bold text-white shadow-sm backdrop-blur dark:bg-black/45 sm:text-[0.68rem]">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-300 text-[0.62rem] font-black text-zinc-950">{player.number}</span>
      <span className="truncate">{player.name}</span>
    </span>
  );
}

function PitchView({ lineup }: { lineup: TeamLineup }) {
  const rows = chunkOutfieldPlayers(lineup.startingEleven, lineup.formation);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-emerald-700/20 bg-[linear-gradient(90deg,rgba(255,255,255,0.05)_50%,transparent_50%),linear-gradient(180deg,#166534,#14532d)] bg-[length:40px_40px,auto] p-3 shadow-inner shadow-black/30">
      <div className="pointer-events-none absolute inset-3 rounded-[1.25rem] border border-white/25" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" />
      <div className="relative grid min-h-64 content-between gap-2 py-2">
        {rows.map((row, index) => (
          <div key={`${lineup.team}-${index}`} className="flex justify-center gap-1.5 sm:gap-2">
            {row.map((player) => <PlayerChip key={player.id} player={player} />)}
          </div>
        ))}
      </div>
    </div>
  );
}

function CompactPlayerList({ players }: { players: LineupPlayer[] }) {
  return (
    <ol className="grid gap-1.5 sm:grid-cols-2">
      {groupedPlayers(players).map((player) => (
        <li key={player.id} className="grid grid-cols-[1.75rem_1fr_auto] items-center gap-2 rounded-lg border border-stone-200 bg-stone-50 px-2 py-1.5 dark:border-zinc-800/80 dark:bg-zinc-900/70">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 text-[0.65rem] font-black text-white dark:bg-zinc-800">{player.number}</span>
          <span className="min-w-0 truncate text-xs font-semibold text-zinc-800 dark:text-zinc-200">{player.name}</span>
          <span className="rounded-full bg-stone-200 px-1.5 py-0.5 text-[0.56rem] font-black text-stone-600 dark:bg-zinc-800 dark:text-zinc-400">{player.position}</span>
        </li>
      ))}
    </ol>
  );
}

function TeamLineupCard({ lineup, teamName }: { lineup: TeamLineup; teamName: string }) {

  return (
    <article className="overflow-hidden rounded-3xl border border-stone-300 bg-white shadow-sm shadow-stone-300/25 dark:border-zinc-800 dark:bg-zinc-950/70 dark:shadow-black/20">
      <div className="flex items-center justify-between gap-3 border-b border-stone-200 bg-stone-50/80 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/70">
        <h3 className="min-w-0 truncate font-black text-zinc-900 dark:text-zinc-100"><TeamName name={teamName} /></h3>
        <span className="rounded-full border border-amber-600/30 bg-amber-100 px-3 py-1 text-xs font-black text-amber-900 dark:border-amber-300/20 dark:bg-amber-300/10 dark:text-amber-100">
          {lineup.formation}
        </span>
      </div>
      <div className="p-3 sm:p-4">
        <PitchView lineup={lineup} />
        {lineup.coach ? (
          <p className="mt-3 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">Coach · {lineup.coach}</p>
        ) : null}
        <div className="mt-3">
          <p className="mb-2 text-[0.65rem] font-black uppercase tracking-[0.18em] text-stone-500 dark:text-zinc-500">XI</p>
          <CompactPlayerList players={lineup.startingEleven} />
        </div>
        {lineup.substitutes?.length ? (
          <div className="mt-3">
            <p className="mb-2 text-[0.65rem] font-black uppercase tracking-[0.18em] text-stone-500 dark:text-zinc-500">Subs</p>
            <CompactPlayerList players={lineup.substitutes} />
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function MatchLineups({ lineup, match, dataSource = "demo" }: MatchLineupsProps) {
  return (
    <section className="overflow-hidden rounded-3xl border border-stone-300 bg-white/90 shadow-lg shadow-stone-300/25 dark:border-zinc-800 dark:bg-zinc-900/80 dark:shadow-black/20">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 bg-stone-50/80 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/50 sm:px-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-700 dark:text-amber-200"><Trans k="lineups" /></p>
          <h2 className="mt-1 text-lg font-black text-zinc-900 dark:text-zinc-100"><Trans k="startingEleven" /></h2>
        </div>
        <span className="rounded-full border border-stone-300 bg-white px-3 py-1 text-xs font-semibold text-stone-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
          {dataSource === "api-football" ? <Trans k="apiFootballData" /> : <Trans k="demoData" />}
        </span>
      </div>

      {lineup ? (
        <div className="grid gap-4 p-4 lg:grid-cols-2 lg:gap-5 sm:p-5">
          <TeamLineupCard lineup={lineup.home} teamName={match.homeTeam.name} />
          <TeamLineupCard lineup={lineup.away} teamName={match.awayTeam.name} />
        </div>
      ) : (
        <div className="m-4 rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-6 text-center dark:border-zinc-700 dark:bg-zinc-950/50">
          <p className="text-sm font-semibold text-stone-600 dark:text-zinc-400"><Trans k="noMockLineups" /></p>
        </div>
      )}
    </section>
  );
}
