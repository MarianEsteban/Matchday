import { usePreferences } from "@/components/ui/AppPreferences";
import { createCompetitionSectionId } from "@/components/matches/CompetitionSection";
import { sidebarSections } from "@/data/mock/competitions";
import type { Match } from "@/types/match";

type CompetitionGroup = {
  name: string;
  matches: Match[];
};

type CompetitionSidebarProps = {
  competitions: CompetitionGroup[];
};

export function CompetitionSidebar({ competitions }: CompetitionSidebarProps) {
  const { t } = usePreferences();
  const competitionMatchCounts = new Map(
    competitions.map((competition) => [competition.name, competition.matches.length]),
  );

  return (
    <aside className="sticky top-6 hidden max-h-[calc(100vh-3rem)] self-start overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950/90 shadow-xl shadow-black/30 lg:block">
      <div className="border-b border-zinc-800 bg-gradient-to-r from-emerald-500/15 via-sky-500/10 to-zinc-900 px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">
          MatchDay
        </p>
        <h2 className="mt-1 text-lg font-bold text-white">{t("competitions")}</h2>
      </div>

      <nav
        aria-label={t("competitions")}
        className="max-h-[calc(100vh-9rem)] space-y-5 overflow-y-auto px-3 py-4"
      >
        {sidebarSections.map((section) => (
          <section key={section.title} aria-labelledby={`sidebar-${section.title}`}>
            <div className="mb-2 flex items-center gap-2 px-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
              <h3
                id={`sidebar-${section.title}`}
                className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500"
              >
                {section.title}
              </h3>
            </div>

            <div className="space-y-1">
              {section.competitions.map((competition) => {
                const currentMatchCount = competitionMatchCounts.get(competition.name);
                const matchCount = currentMatchCount ?? competition.fallbackMatchCount;
                const hasCurrentSection = currentMatchCount !== undefined;
                const className = `flex w-full items-center justify-between gap-3 rounded-2xl border px-3 py-2.5 text-left text-sm transition-colors ${
                  hasCurrentSection
                    ? "border-transparent text-zinc-200 hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-white"
                    : "border-transparent text-zinc-500"
                }`;

                if (!hasCurrentSection) {
                  return (
                    <div key={competition.name} className={className} aria-disabled="true">
                      <span className="truncate">{competition.name}</span>
                      <span className="rounded-full border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-xs font-semibold text-zinc-500">
                        {matchCount}
                      </span>
                    </div>
                  );
                }

                return (
                  <a
                    key={competition.name}
                    href={`#${createCompetitionSectionId(competition.name)}`}
                    className={className}
                  >
                    <span className="truncate">{competition.name}</span>
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-200">
                      {matchCount}
                    </span>
                  </a>
                );
              })}
            </div>
          </section>
        ))}
      </nav>
    </aside>
  );
}
