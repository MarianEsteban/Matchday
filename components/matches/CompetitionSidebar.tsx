"use client";

import { usePreferences } from "@/components/ui/AppPreferences";
import { translateCompetitionName } from "@/lib/i18n";
import type { Match } from "@/types/match";

type CompetitionGroup = {
  name: string;
  matches: Match[];
  isFeatured: boolean;
};

type CompetitionSidebarProps = {
  competitions: CompetitionGroup[];
  selectedCompetition: string | null;
  onSelectCompetition: (competition: string | null) => void;
};

function MatchCount({ count, isActive }: { count: number; isActive: boolean }) {
  return (
    <span className={`rounded-full border px-2 py-0.5 text-xs font-bold ${
      isActive
        ? "border-white/30 bg-white/20 text-white"
        : count > 0
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200"
          : "border-stone-300 bg-stone-100 text-stone-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-500"
    }`}
    >
      {count}
    </span>
  );
}

export function CompetitionSidebar({ competitions, selectedCompetition, onSelectCompetition }: CompetitionSidebarProps) {
  const { language, t } = usePreferences();
  const featuredWithMatches = competitions.filter((competition) => competition.isFeatured && competition.matches.length > 0);
  const otherWithMatches = competitions.filter((competition) => !competition.isFeatured && competition.matches.length > 0);
  const featuredWithoutMatches = competitions.filter((competition) => competition.isFeatured && competition.matches.length === 0);
  const sections = [
    { title: t("featured"), competitions: featuredWithMatches },
    { title: t("otherCompetitions"), competitions: otherWithMatches },
    { title: t("allCompetitions"), competitions: featuredWithoutMatches },
  ].filter((section) => section.competitions.length > 0);

  return (
    <aside className="sticky top-6 hidden max-h-[calc(100vh-3rem)] self-start overflow-hidden rounded-3xl border border-stone-300 bg-white/90 shadow-xl shadow-stone-300/40 dark:border-zinc-800 dark:bg-zinc-950/90 dark:shadow-black/30 lg:block">
      <div className="border-b border-stone-300 bg-gradient-to-r from-emerald-100 via-sky-50 to-white px-4 py-4 dark:border-zinc-800 dark:from-emerald-500/15 dark:via-sky-500/10 dark:to-zinc-900">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700 dark:text-emerald-300">MatchDay</p>
        <h2 className="mt-1 text-lg font-bold text-zinc-950 dark:text-white">{t("competitions")}</h2>
      </div>

      <nav aria-label={t("competitions")} className="max-h-[calc(100vh-9rem)] space-y-5 overflow-y-auto px-3 py-4">
        <button
          type="button"
          onClick={() => onSelectCompetition(null)}
          className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-3 py-2.5 text-left text-sm font-semibold transition-colors ${
            selectedCompetition === null
              ? "border-emerald-500 bg-emerald-600 text-white shadow-sm shadow-emerald-500/25"
              : "border-transparent text-zinc-700 hover:border-emerald-500/40 hover:bg-emerald-50 hover:text-zinc-950 dark:text-zinc-200 dark:hover:bg-emerald-500/10 dark:hover:text-white"
          }`}
        >
          <span className="truncate">{t("featured")}</span>
          <MatchCount count={featuredWithMatches.reduce((total, competition) => total + competition.matches.length, 0)} isActive={selectedCompetition === null} />
        </button>

        {sections.map((section) => (
          <section key={section.title} aria-labelledby={`sidebar-${section.title}`}>
            <div className="mb-2 flex items-center gap-2 px-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
              <h3 id={`sidebar-${section.title}`} className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500 dark:text-zinc-500">{section.title}</h3>
            </div>

            <div className="space-y-1">
              {section.competitions.map((competition) => {
                const isActive = selectedCompetition === competition.name;
                return (
                  <button
                    key={competition.name}
                    type="button"
                    onClick={() => onSelectCompetition(competition.name)}
                    className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-3 py-2.5 text-left text-sm transition-colors ${
                      isActive
                        ? "border-emerald-500 bg-emerald-600 text-white shadow-sm shadow-emerald-500/25"
                        : competition.matches.length > 0
                          ? "border-transparent text-zinc-700 hover:border-emerald-500/40 hover:bg-emerald-50 hover:text-zinc-950 dark:text-zinc-200 dark:hover:bg-emerald-500/10 dark:hover:text-white"
                          : "border-transparent text-stone-500 dark:text-zinc-500"
                    }`}
                    disabled={competition.matches.length === 0}
                  >
                    <span className="truncate">{translateCompetitionName(competition.name, language)}</span>
                    <MatchCount count={competition.matches.length} isActive={isActive} />
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </nav>
    </aside>
  );
}
