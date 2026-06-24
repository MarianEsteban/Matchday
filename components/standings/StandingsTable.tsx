"use client";

import { Trans, usePreferences } from "@/components/ui/AppPreferences";
import { translateCompetitionName } from "@/lib/i18n";
import type { CompetitionStandings } from "@/types/standing";

type StandingsTableProps = {
  standings: CompetitionStandings;
  highlightedTeamIds?: string[];
  previewRows?: number;
};

export function StandingsTable({
  standings,
  highlightedTeamIds = [],
  previewRows = standings.rows.length,
}: StandingsTableProps) {
  const { language, t } = usePreferences();
  const rows = standings.rows.slice(0, previewRows);

  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/80 shadow-sm shadow-black/20">
      <div className="border-b border-zinc-800 px-5 py-4">
        <p className="text-xs uppercase tracking-wide text-amber-200"><Trans k="tablePositions" /></p>
        <h2 className="mt-1 text-xl font-semibold text-zinc-100">{translateCompetitionName(standings.competition, language)}</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="bg-zinc-950/60 text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-semibold">#</th>
              <th className="px-4 py-3 font-semibold"><Trans k="team" /></th>
              <th className="px-3 py-3 text-center font-semibold">{t("played")}</th>
              <th className="px-3 py-3 text-center font-semibold">{t("won")}</th>
              <th className="px-3 py-3 text-center font-semibold">{t("drawn")}</th>
              <th className="px-3 py-3 text-center font-semibold">{t("lost")}</th>
              <th className="px-3 py-3 text-center font-semibold">{t("goalDifference")}</th>
              <th className="px-4 py-3 text-center font-semibold">{t("points")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {rows.map((row) => {
              const isHighlighted = highlightedTeamIds.includes(row.teamId);

              return (
                <tr
                  key={row.teamId}
                  className={isHighlighted ? "bg-amber-400/10 text-amber-50" : "text-zinc-300"}
                >
                  <td className="px-4 py-3 font-semibold text-zinc-500">{row.position}</td>
                  <td className="px-4 py-3 font-semibold">{row.teamName}</td>
                  <td className="px-3 py-3 text-center">{row.played}</td>
                  <td className="px-3 py-3 text-center">{row.won}</td>
                  <td className="px-3 py-3 text-center">{row.drawn}</td>
                  <td className="px-3 py-3 text-center">{row.lost}</td>
                  <td className="px-3 py-3 text-center">{row.goalDifference}</td>
                  <td className="px-4 py-3 text-center font-bold text-zinc-100">{row.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
