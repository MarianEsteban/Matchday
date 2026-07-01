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
    <span className="flex min-w-0 max-w-[4.75rem] items-center gap-1 rounded border border-white/20 bg-zinc-950/75 px-1 py-0.5 text-[0.54rem] font-semibold leading-4 text-white sm:max-w-[5.8rem] sm:px-1.5 sm:text-[0.6rem]">
      <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-[0.48rem] font-black text-zinc-950 sm:h-4 sm:w-4">{player.number}</span>
      <span className="min-w-0 truncate" title={player.name}>{shortPlayerName(player.name)}</span>
    </span>
  );
}

function PitchView({ lineup }: { lineup: TeamLineup }) {
  const rows = chunkOutfieldPlayers(lineup.startingEleven, lineup.formation);

  return (
    <div className="relative overflow-hidden rounded-lg border border-emerald-700/25 bg-[linear-gradient(90deg,rgba(255,255,255,0.045)_50%,transparent_50%),linear-gradient(180deg,#177245,#115c36)] bg-[length:34px_34px,auto] px-2 py-3 shadow-inner shadow-black/30 sm:px-3">
      <div className="pointer-events-none absolute inset-2 rounded-xl border border-white/25" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" />
      <div className="pointer-events-none absolute inset-x-2 top-1/2 border-t border-white/15" />
      <div className="relative grid min-h-[12rem] content-between gap-1.5 py-1.5 sm:min-h-[13.5rem] sm:gap-2">
        {rows.map((row, index) => (
          <div key={`${lineup.team}-${index}`} className="grid grid-flow-col justify-center gap-1 sm:gap-1.5" style={{ gridAutoColumns: "minmax(0, max-content)" }}>
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
    <article className="rounded-lg border border-stone-300 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/70 dark:shadow-black/20">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-black text-zinc-900 dark:text-zinc-100"><TeamName name={teamName} /></h3>
          {lineup.coach ? <p className="mt-0.5 truncate text-xs font-semibold text-stone-500 dark:text-zinc-500">Coach · {lineup.coach}</p> : null}
        </div>
        <span className="shrink-0 rounded border border-stone-300 bg-stone-50 px-2 py-1 text-xs font-semibold text-stone-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
          {lineup.formation}
        </span>
      </div>
      <PitchView lineup={lineup} />
      <details className="mt-2 rounded-lg border border-stone-200 bg-stone-50/80 dark:border-zinc-800 dark:bg-zinc-900/60">
        <summary className="cursor-pointer px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-stone-500 marker:text-stone-500 dark:text-zinc-500">XI</summary>
        <div className="border-t border-stone-200 p-2 dark:border-zinc-800">
          <CompactPlayerList players={lineup.startingEleven} />
        </div>
      </details>
      {lineup.substitutes?.length ? (
        <details className="mt-2 rounded-lg border border-stone-200 bg-stone-50/70 dark:border-zinc-800 dark:bg-zinc-900/50">
          <summary className="cursor-pointer px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-stone-500 marker:text-stone-500 dark:text-zinc-500">Subs</summary>
          <div className="border-t border-stone-200 p-2 dark:border-zinc-800">
            <CompactPlayerList players={lineup.substitutes} />
          </div>
        </details>
      ) : null}
    </article>
  );
}

export function MatchLineups({ lineup, match, dataSource = "demo" }: MatchLineupsProps) {
  return (
    <section className="overflow-hidden rounded-lg border border-stone-300 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80 dark:shadow-black/20">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 bg-stone-50/80 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/50 sm:px-5">
        <div>
          <p className="text-xs font-semibold text-stone-500 dark:text-zinc-400"><Trans k="lineups" /></p>
          <h2 className="mt-0.5 text-base font-bold text-zinc-900 dark:text-zinc-100"><Trans k="startingEleven" /></h2>
        </div>
        <span className="rounded-full border border-stone-300 bg-white px-3 py-1 text-xs font-semibold text-stone-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
          {dataSource === "api-football" || dataSource === "cached-api-football" ? <Trans k="apiFootballData" /> : <Trans k="demoData" />}
        </span>
      </div>

      {lineup ? (
        <div className="grid gap-3 p-3 sm:p-4 lg:grid-cols-2">
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
