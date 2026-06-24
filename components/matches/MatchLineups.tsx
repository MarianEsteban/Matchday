import { Trans } from "@/components/ui/AppPreferences";
import type { MatchLineup, TeamLineup } from "@/types/lineup";
import type { Match } from "@/types/match";

type MatchLineupsProps = {
  lineup?: MatchLineup;
  match: Match;
};

function TeamLineupCard({ lineup, teamName }: { lineup: TeamLineup; teamName: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
      <div className="flex items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <h3 className="font-semibold text-zinc-100">{teamName}</h3>
        <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs font-bold text-amber-100">
          {lineup.formation}
        </span>
      </div>
      <ol className="mt-4 grid gap-2">
        {lineup.startingEleven.map((player) => (
          <li
            key={player.id}
            className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 rounded-xl border border-zinc-800/80 bg-zinc-900/80 px-3 py-2"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-xs font-black text-zinc-100">
              {player.number}
            </span>
            <span className="text-sm font-semibold text-zinc-200">{player.name}</span>
            <span className="rounded-full bg-zinc-800 px-2 py-1 text-[0.65rem] font-bold text-zinc-400">
              {player.position}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function MatchLineups({ lineup, match }: MatchLineupsProps) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-sm shadow-black/20">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-amber-200"><Trans k="lineups" /></p>
          <h2 className="mt-1 text-xl font-semibold text-zinc-100"><Trans k="startingEleven" /></h2>
        </div>
        <span className="rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1 text-xs font-semibold text-zinc-400">
          <Trans k="demoData" />
        </span>
      </div>

      {lineup ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <TeamLineupCard lineup={lineup.home} teamName={match.homeTeam.name} />
          <TeamLineupCard lineup={lineup.away} teamName={match.awayTeam.name} />
        </div>
      ) : (
        <p className="mt-3 text-sm text-zinc-400"><Trans k="noMockLineups" /></p>
      )}
    </section>
  );
}
