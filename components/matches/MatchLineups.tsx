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

function shortPlayerName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return name;

  const lastName = parts.at(-1) ?? name;
  const firstInitial = parts[0]?.[0] ? `${parts[0][0]}.` : "";
  return `${firstInitial} ${lastName}`.trim();
}

function PlayerChip({ player }: { player: LineupPlayer }) {
  return (
    <span className="flex min-w-0 max-w-[5.7rem] items-center gap-1 rounded-full border border-white/20 bg-zinc-950/72 px-1.5 py-0.5 text-[0.58rem] font-extrabold leading-5 text-white shadow-sm ring-1 ring-black/10 backdrop-blur sm:max-w-[6.6rem] sm:px-2 sm:text-[0.63rem]">
      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-300 text-[0.52rem] font-black text-zinc-950 sm:h-[1.125rem] sm:w-[1.125rem]">{player.number}</span>
      <span className="min-w-0 truncate" title={player.name}>{shortPlayerName(player.name)}</span>
    </span>
  );
}

function PitchView({ lineup }: { lineup: TeamLineup }) {
  const rows = chunkOutfieldPlayers(lineup.startingEleven, lineup.formation);

  return (
    <div className="relative overflow-hidden rounded-[1.35rem] border border-emerald-700/25 bg-[linear-gradient(90deg,rgba(255,255,255,0.045)_50%,transparent_50%),linear-gradient(180deg,#177245,#115c36)] bg-[length:38px_38px,auto] px-3 py-4 shadow-inner shadow-black/30 sm:px-4">
      <div className="pointer-events-none absolute inset-3 rounded-2xl border border-white/25" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" />
      <div className="pointer-events-none absolute inset-x-3 top-1/2 border-t border-white/15" />
      <div className="relative grid min-h-[18rem] content-between gap-3 py-3 sm:min-h-[20rem] sm:gap-4">
        {rows.map((row, index) => (
          <div key={`${lineup.team}-${index}`} className="grid grid-flow-col justify-center gap-1.5 sm:gap-2" style={{ gridAutoColumns: "minmax(0, max-content)" }}>
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
        <li key={player.id} className="grid grid-cols-[1.6rem_1fr_auto] items-center gap-2 rounded-lg border border-stone-200 bg-stone-50 px-2 py-1.5 dark:border-zinc-800/80 dark:bg-zinc-900/70">
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
    <article className="rounded-3xl border border-stone-300 bg-white p-3 shadow-sm shadow-stone-300/25 dark:border-zinc-800 dark:bg-zinc-950/70 dark:shadow-black/20 sm:p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-black text-zinc-900 dark:text-zinc-100"><TeamName name={teamName} /></h3>
          {lineup.coach ? <p className="mt-0.5 truncate text-xs font-semibold text-stone-500 dark:text-zinc-500">Coach · {lineup.coach}</p> : null}
        </div>
        <span className="shrink-0 rounded-full border border-amber-600/30 bg-amber-100 px-3 py-1 text-xs font-black text-amber-900 dark:border-amber-300/20 dark:bg-amber-300/10 dark:text-amber-100">
          {lineup.formation}
        </span>
      </div>
      <PitchView lineup={lineup} />
      <details className="mt-3 rounded-2xl border border-stone-200 bg-stone-50/80 dark:border-zinc-800 dark:bg-zinc-900/60">
        <summary className="cursor-pointer px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-stone-500 marker:text-amber-600 dark:text-zinc-500">XI</summary>
        <div className="border-t border-stone-200 p-3 dark:border-zinc-800">
          <CompactPlayerList players={lineup.startingEleven} />
        </div>
      </details>
      {lineup.substitutes?.length ? (
        <details className="mt-2 rounded-2xl border border-stone-200 bg-stone-50/70 dark:border-zinc-800 dark:bg-zinc-900/50">
          <summary className="cursor-pointer px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-stone-500 marker:text-amber-600 dark:text-zinc-500">Subs</summary>
          <div className="border-t border-stone-200 p-3 dark:border-zinc-800">
            <CompactPlayerList players={lineup.substitutes} />
          </div>
        </details>
      ) : null}
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
          {dataSource === "api-football" || dataSource === "cached-api-football" ? <Trans k="apiFootballData" /> : <Trans k="demoData" />}
        </span>
      </div>

      {lineup ? (
        <div className="grid gap-4 p-4 sm:p-5">
          <TeamLineupCard lineup={lineup.home} teamName={match.homeTeam.name} />
          <TeamLineupCard lineup={lineup.away} teamName={match.awayTeam.name} />
        </div>
      ) : (
        <div className="m-4 rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-6 text-center dark:border-zinc-700 dark:bg-zinc-950/50">
          <p className="text-sm font-semibold text-stone-600 dark:text-zinc-400"><Trans k="lineupsUnavailable" /></p>
        </div>
      )}
    </section>
  );
}
