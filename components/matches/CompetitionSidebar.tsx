import { createCompetitionSectionId } from "@/components/matches/CompetitionSection";
import type { Match } from "@/types/match";

type CompetitionSidebarProps = {
  competitions: Array<{
    name: string;
    matches: Match[];
  }>;
};

export function CompetitionSidebar({ competitions }: CompetitionSidebarProps) {
  return (
    <aside className="sticky top-6 hidden self-start rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 shadow-sm shadow-black/20 lg:block">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        Competiciones
      </p>
      <nav aria-label="Competiciones" className="mt-3 space-y-2">
        {competitions.map((competition) => (
          <a
            key={competition.name}
            href={`#${createCompetitionSectionId(competition.name)}`}
            className="flex items-center justify-between gap-3 rounded-xl border border-transparent px-3 py-2 text-sm text-zinc-300 transition-colors hover:border-zinc-700 hover:bg-zinc-950 hover:text-white"
          >
            <span>{competition.name}</span>
            <span className="rounded-full border border-zinc-700 bg-zinc-950 px-2 py-0.5 text-xs font-semibold text-zinc-400">
              {competition.matches.length}
            </span>
          </a>
        ))}
      </nav>
    </aside>
  );
}
