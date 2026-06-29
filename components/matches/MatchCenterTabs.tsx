"use client";

import { useState, type ReactNode } from "react";
import { MatchEventsTimeline } from "@/components/matches/MatchEventsTimeline";
import { MatchLineups } from "@/components/matches/MatchLineups";
import { MatchStats } from "@/components/matches/MatchStats";
import { StandingsTable } from "@/components/standings/StandingsTable";
import { Trans, usePreferences } from "@/components/ui/AppPreferences";
import { LocalizedKickoff } from "@/components/ui/LocalizedKickoff";
import { TranslatedCompetitionName } from "@/components/ui/TranslatedCompetitionName";
import { TranslatedStatus } from "@/components/ui/TranslatedStatus";
import type { TranslationKey } from "@/lib/i18n";
import type { MatchDetails } from "@/types/match";

type MatchCenterTabsProps = MatchDetails;

type TabId = "details" | "lineups" | "statistics" | "events" | "standings";

const tabs: { id: TabId; labelKey: TranslationKey }[] = [
  { id: "details", labelKey: "details" },
  { id: "lineups", labelKey: "lineups" },
  { id: "statistics", labelKey: "statistics" },
  { id: "events", labelKey: "events" },
  { id: "standings", labelKey: "standings" },
];

function DetailRow({ labelKey, children }: { labelKey: TranslationKey; children?: ReactNode }) {
  if (!children) return null;

  return (
    <div className="rounded-2xl border border-stone-200 bg-stone-50 px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-950/55">
      <dt className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-stone-500 dark:text-zinc-500"><Trans k={labelKey} /></dt>
      <dd className="mt-1 text-sm font-bold text-zinc-900 dark:text-zinc-100">{children}</dd>
    </div>
  );
}

function DetailsPanel({ details }: { details: MatchDetails }) {
  const { match, source } = details;
  const stage = match.apiFootball?.round;

  return (
    <section className="rounded-3xl border border-stone-300 bg-white/92 p-4 shadow-sm shadow-stone-300/25 dark:border-zinc-800 dark:bg-zinc-900/80 dark:shadow-black/20 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-700 dark:text-amber-200"><Trans k="details" /></p>
          <h2 className="mt-1 text-lg font-black text-zinc-950 dark:text-zinc-50"><Trans k="matchSummary" /></h2>
        </div>
        <span className="rounded-full border border-stone-300 bg-white px-3 py-1 text-xs font-semibold text-stone-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
          {source === "api-football" || source === "cached-api-football" ? <Trans k="apiFootballData" /> : <Trans k="demoData" />}
        </span>
      </div>
      <dl className="grid gap-2 sm:grid-cols-2">
        <DetailRow labelKey="competitions"><TranslatedCompetitionName competition={match.competition} /></DetailRow>
        <DetailRow labelKey="stage">{stage}</DetailRow>
        <DetailRow labelKey="kickoff"><LocalizedKickoff date={match.date} kickoffTime={match.kickoffTime} kickoffAt={match.kickoffAt} /></DetailRow>
        <DetailRow labelKey="stadium">{match.venue}</DetailRow>
        <DetailRow labelKey="status"><TranslatedStatus status={match.status} /></DetailRow>
      </dl>
    </section>
  );
}

function EmptyStandings() {
  return (
    <section className="rounded-3xl border border-dashed border-stone-300 bg-white/80 p-6 text-center dark:border-zinc-700 dark:bg-zinc-900/70">
      <p className="text-sm font-semibold text-stone-600 dark:text-zinc-400"><Trans k="standingsUnavailable" /></p>
    </section>
  );
}

export function MatchCenterTabs(details: MatchCenterTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("details");
  const { t } = usePreferences();
  const highlightedTeamIds = [details.match.homeTeam.id, details.match.awayTeam.id];

  return (
    <div className="mt-4">
      <nav className="overflow-x-auto rounded-2xl border border-stone-300 bg-white/90 p-1.5 shadow-lg shadow-stone-300/20 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90 dark:shadow-black/30" aria-label={t("matchSections")} role="tablist">
        <div className="flex min-w-max gap-1.5">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                onClick={() => setActiveTab(tab.id)}
                aria-selected={isActive}
                className={`rounded-full px-4 py-2 text-sm font-black transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${isActive ? "bg-zinc-950 text-white shadow-sm dark:bg-amber-300 dark:text-zinc-950" : "text-zinc-600 hover:bg-stone-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"}`}
              >
                <Trans k={tab.labelKey} />
              </button>
            );
          })}
        </div>
      </nav>

      <div className="mt-4 pb-12">
        {activeTab === "details" ? <DetailsPanel details={details} /> : null}
        {activeTab === "lineups" ? <MatchLineups lineup={details.lineup} match={details.match} dataSource={details.source} /> : null}
        {activeTab === "statistics" ? <MatchStats statistics={details.statistics} match={details.match} dataSource={details.source} /> : null}
        {activeTab === "events" ? <MatchEventsTimeline events={details.events} match={details.match} dataSource={details.source} /> : null}
        {activeTab === "standings" ? details.standings ? <StandingsTable standings={details.standings} highlightedTeamIds={highlightedTeamIds} previewRows={8} /> : <EmptyStandings /> : null}
      </div>
    </div>
  );
}
