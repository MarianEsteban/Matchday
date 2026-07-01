"use client";

import { useMemo, useState } from "react";
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
    <span className={`rounded-full px-2 py-0.5 text-[0.68rem] font-black ${isActive ? "bg-white/20 text-white dark:bg-zinc-950/10 dark:text-zinc-950" : count > 0 ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-stone-100 text-stone-400 dark:bg-zinc-800 dark:text-zinc-500"}`}>
      {count}
    </span>
  );
}

export function CompetitionSidebar({ competitions, selectedCompetition, onSelectCompetition }: CompetitionSidebarProps) {
  const { language, t } = usePreferences();
  const [query, setQuery] = useState("");
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const featuredWithMatches = competitions.filter((competition) => competition.isFeatured && competition.matches.length > 0);
  const otherWithMatches = competitions.filter((competition) => !competition.isFeatured && competition.matches.length > 0);
  const featuredWithoutMatches = competitions.filter((competition) => competition.isFeatured && competition.matches.length === 0);
  const featuredCount = featuredWithMatches.reduce((total, competition) => total + competition.matches.length, 0);

  const sections = useMemo(() => [
    { title: t("featured"), competitions: featuredWithMatches },
    { title: t("otherCompetitions"), competitions: otherWithMatches },
    { title: t("allCompetitions"), competitions: featuredWithoutMatches },
  ].map((section) => ({
    ...section,
    competitions: section.competitions.filter((competition) => translateCompetitionName(competition.name, language).toLowerCase().includes(query.trim().toLowerCase())),
  })).filter((section) => section.competitions.length > 0), [featuredWithMatches, featuredWithoutMatches, language, otherWithMatches, query, t]);

  const content = (
    <>
      <div className="border-b border-stone-200 px-3 py-3 dark:border-zinc-800">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-stone-500 dark:text-zinc-500">{t("browseCompetitions")}</p>
            <h2 className="text-base font-black text-zinc-950 dark:text-white">{t("competitions")}</h2>
          </div>
          <MatchCount count={competitions.filter((competition) => competition.matches.length > 0).length} isActive={false} />
        </div>
        {competitions.length > 8 ? (
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("competitions")}
            className="mt-3 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-semibold text-zinc-900 outline-none transition placeholder:text-stone-400 focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:placeholder:text-zinc-600"
          />
        ) : null}
      </div>

      <nav aria-label={t("competitions")} className="max-h-[calc(100vh-11rem)] space-y-4 overflow-y-auto p-2.5">
        <button
          type="button"
          onClick={() => {
            onSelectCompetition(null);
            setIsMobileOpen(false);
          }}
          className={`flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm font-semibold transition ${selectedCompetition === null ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950" : "text-zinc-700 hover:bg-stone-100 dark:text-zinc-200 dark:hover:bg-zinc-800"}`}
        >
          <span className="truncate">{t("featured")}</span>
          <MatchCount count={featuredCount} isActive={selectedCompetition === null} />
        </button>

        {sections.map((section) => (
          <section key={section.title} aria-labelledby={`sidebar-${section.title}`}>
            <h3 id={`sidebar-${section.title}`} className="mb-1.5 px-2 text-[0.62rem] font-black uppercase tracking-[0.18em] text-stone-400 dark:text-zinc-500">{section.title}</h3>
            <div className="space-y-0.5">
              {section.competitions.map((competition) => {
                const isActive = selectedCompetition === competition.name;
                return (
                  <button
                    key={competition.name}
                    type="button"
                    onClick={() => {
                      onSelectCompetition(competition.name);
                      setIsMobileOpen(false);
                    }}
                    className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm transition ${isActive ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950" : competition.matches.length > 0 ? "text-zinc-700 hover:bg-emerald-50 hover:text-zinc-950 dark:text-zinc-200 dark:hover:bg-emerald-500/10 dark:hover:text-white" : "text-stone-400 dark:text-zinc-600"}`}
                    disabled={competition.matches.length === 0}
                  >
                    <span className="truncate font-semibold">{translateCompetitionName(competition.name, language)}</span>
                    <MatchCount count={competition.matches.length} isActive={isActive} />
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </nav>
    </>
  );

  return (
    <>
      <aside className="hidden self-start overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950/88 dark:shadow-black/25 lg:sticky lg:top-4 lg:block">
        {content}
      </aside>
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setIsMobileOpen((open) => !open)}
          aria-expanded={isMobileOpen}
          className="flex w-full items-center justify-between rounded-lg border border-stone-200 bg-white px-4 py-3 text-left shadow-sm transition hover:border-emerald-500/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 dark:border-zinc-800 dark:bg-zinc-950/88 dark:shadow-black/20"
        >
          <span>
            <span className="block text-xs font-semibold text-stone-500 dark:text-zinc-500">{t("browseCompetitions")}</span>
            <span className="mt-0.5 block text-sm font-black text-zinc-950 dark:text-white">{selectedCompetition ? translateCompetitionName(selectedCompetition, language) : t("featured")}</span>
          </span>
          <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-black text-stone-600 dark:bg-zinc-800 dark:text-zinc-300">{isMobileOpen ? "−" : "+"}</span>
        </button>
        {isMobileOpen ? (
          <aside className="mt-2 max-h-[72vh] overflow-hidden rounded-2xl border border-stone-200 bg-white/96 shadow-lg shadow-stone-200/50 dark:border-zinc-800 dark:bg-zinc-950/96 dark:shadow-black/30">
            {content}
          </aside>
        ) : null}
      </div>
    </>
  );
}
