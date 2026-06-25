"use client";

import { usePreferences } from "@/components/ui/AppPreferences";
import { createCompetitionSectionId } from "@/components/matches/CompetitionSection";
import { sidebarSections } from "@/data/mock/competitions";
import { translateCompetitionName } from "@/lib/i18n";
import type { Match, MatchListDataSource } from "@/types/match";

type CompetitionGroup = {
  name: string;
  matches: Match[];
};

type CompetitionSidebarProps = {
  competitions: CompetitionGroup[];
  dataSource: MatchListDataSource;
};

function createApiFootballSidebarSections(competitions: CompetitionGroup[]) {
  return [
    {
      title: "Today",
      competitions: competitions.map((competition) => ({
        name: competition.name,
        fallbackMatchCount: 0,
      })),
    },
  ];
}

export function CompetitionSidebar({ competitions, dataSource }: CompetitionSidebarProps) {
  const { language, t } = usePreferences();
  const competitionMatchCounts = new Map(
    competitions.map((competition) => [competition.name, competition.matches.length]),
  );

  return (
    <aside className="sticky top-6 hidden max-h-[calc(100vh-3rem)] self-start overflow-hidden rounded-3xl border border-stone-300 bg-white/90 shadow-xl shadow-stone-300/40 dark:border-zinc-800 dark:bg-zinc-950/90 dark:shadow-black/30 lg:block">
      <div className="border-b border-stone-300 bg-gradient-to-r from-emerald-100 via-sky-50 to-white px-4 py-4 dark:border-zinc-800 dark:from-emerald-500/15 dark:via-sky-500/10 dark:to-zinc-900">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700 dark:text-emerald-300">
          MatchDay
        </p>
        <h2 className="mt-1 text-lg font-bold text-zinc-950 dark:text-white">{t("competitions")}</h2>
      </div>

      <nav
        aria-label={t("competitions")}
        className="max-h-[calc(100vh-9rem)] space-y-5 overflow-y-auto px-3 py-4"
      >
        {(dataSource === "api-football" ? createApiFootballSidebarSections(competitions) : sidebarSections).map((section) => (
          <section key={translateCompetitionName(section.title, language)} aria-labelledby={`sidebar-${translateCompetitionName(section.title, language)}`}>
            <div className="mb-2 flex items-center gap-2 px-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
              <h3
                id={`sidebar-${translateCompetitionName(section.title, language)}`}
                className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500 dark:text-zinc-500"
              >
                {translateCompetitionName(section.title, language)}
              </h3>
            </div>

            <div className="space-y-1">
              {section.competitions.map((competition) => {
                const currentMatchCount = competitionMatchCounts.get(competition.name);
                const matchCount = currentMatchCount ?? competition.fallbackMatchCount;
                const hasCurrentSection = currentMatchCount !== undefined;
                const className = `flex w-full items-center justify-between gap-3 rounded-2xl border px-3 py-2.5 text-left text-sm transition-colors ${
                  hasCurrentSection
                    ? "border-transparent text-zinc-700 hover:border-emerald-500/40 hover:bg-emerald-50 hover:text-zinc-950 dark:text-zinc-200 dark:hover:bg-emerald-500/10 dark:hover:text-white"
                    : "border-transparent text-stone-500 dark:text-zinc-500"
                }`;

                if (!hasCurrentSection) {
                  return (
                    <div key={competition.name} className={className} aria-disabled="true">
                      <span className="truncate">{translateCompetitionName(competition.name, language)}</span>
                      <span className="rounded-full border border-stone-300 bg-stone-100 px-2 py-0.5 text-xs font-semibold text-stone-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-500">
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
                    <span className="truncate">{translateCompetitionName(competition.name, language)}</span>
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-200">
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
