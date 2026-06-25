import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MatchEventsTimeline } from "@/components/matches/MatchEventsTimeline";
import { MatchLineups } from "@/components/matches/MatchLineups";
import { PreferenceControls, Trans } from "@/components/ui/AppPreferences";
import { TranslatedStatus } from "@/components/ui/TranslatedStatus";
import { LocalizedKickoff } from "@/components/ui/LocalizedKickoff";
import { TranslatedCompetitionName } from "@/components/ui/TranslatedCompetitionName";
import { MatchStats } from "@/components/matches/MatchStats";
import { StandingsTable } from "@/components/standings/StandingsTable";
import { getMatchDetailsById } from "@/data/repositories/matches.repository";
import type { MatchStatus } from "@/types/match";
import { TeamName } from "@/components/ui/TeamName";

type MatchDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const statusBadgeStyles: Record<MatchStatus, string> = {
  scheduled: "border-sky-600/30 bg-sky-100 text-sky-800 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200",
  live: "border-emerald-600/30 bg-emerald-100 text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-400/15 dark:text-emerald-200",
  finished: "border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-zinc-600/40 dark:bg-zinc-800 dark:text-zinc-300",
};

export default async function MatchDetailPage({ params }: MatchDetailPageProps) {
  const { id } = await params;
  const details = await getMatchDetailsById(id);

  if (!details) {
    notFound();
  }

  const { match, events, statistics, lineup, standings, source } = details;
  const highlightedTeamIds = [match.homeTeam.id, match.awayTeam.id];

  return (
    <main className="min-h-screen bg-[#fbf7ee] pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-zinc-950 dark:bg-zinc-950 dark:text-white">
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 lg:mb-8">
        <Link
          href="/"
          className="inline-flex rounded-full border border-stone-300 bg-white/80 px-4 py-2 text-sm font-semibold text-zinc-800 shadow-sm transition-colors hover:border-stone-500 hover:bg-white hover:text-zinc-950 dark:border-zinc-800 dark:bg-transparent dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-900 dark:hover:text-white"
        >
          ← <Trans k="backToMatches" />
        </Link>
        <PreferenceControls />
        </div>

        <section className="overflow-hidden rounded-3xl sm:rounded-[2rem] border border-stone-300 bg-white/90 shadow-2xl shadow-stone-300/30 dark:border-zinc-800 dark:bg-zinc-900/90 dark:shadow-black/40">
          <div className="border-b border-zinc-800 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.18),transparent_34%),linear-gradient(135deg,rgba(39,39,42,0.98),rgba(9,9,11,0.98))] p-4 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-wide text-amber-200">
                  <TranslatedCompetitionName competition={match.competition} />
                </p>
                <h1 className="mt-2 text-2xl font-bold leading-tight text-white sm:mt-3 sm:text-5xl">
                  <TeamName name={match.homeTeam.name} /> vs <TeamName name={match.awayTeam.name} />
                </h1>
              </div>

              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusBadgeStyles[match.status]}`}
              >
                {match.status === "live" ? (
                  <span className="mr-2 h-2 w-2 rounded-full bg-emerald-300" />
                ) : null}
                <TranslatedStatus status={match.status} />
              </span>
            </div>
          </div>

          <div className="grid gap-4 p-3 sm:gap-6 sm:p-8 lg:grid-cols-[1.6fr_0.9fr]">
            <div className="relative overflow-hidden rounded-3xl border border-amber-600/25 bg-white dark:border-amber-300/20 dark:bg-zinc-950 p-4 text-center shadow-2xl shadow-amber-950/20 sm:p-8">
              <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-amber-200/70 to-transparent" />
              <p className="mb-3 text-xs sm:mb-6 font-bold uppercase tracking-[0.35em] text-stone-600 dark:text-zinc-500">
                <Trans k="score" />
              </p>
              <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-5">
                <div className="flex min-w-0 flex-col items-center gap-2 sm:gap-4">
                  <Image
                    src={match.homeTeam.crestUrl}
                    alt={`${match.homeTeam.name} crest`}
                    width={88}
                    height={88}
                    className="h-12 w-12 drop-shadow-lg sm:h-24 sm:w-24"
                  />
                  <p className="max-w-full truncate text-sm font-black text-zinc-950 dark:text-zinc-50 sm:text-3xl">
                    <TeamName name={match.homeTeam.name} />
                  </p>
                </div>
                <div className="rounded-[1.75rem] border border-amber-300/30 bg-gradient-to-b from-white to-amber-50 dark:from-zinc-800 dark:to-zinc-950 px-4 py-3 text-3xl font-black tracking-tight sm:px-9 sm:py-6 sm:text-6xl text-zinc-950 dark:text-zinc-50 shadow-inner shadow-black/60">
                  {match.score ? `${match.score.home} - ${match.score.away}` : "vs"}
                </div>
                <div className="flex min-w-0 flex-col items-center gap-2 sm:gap-4">
                  <Image
                    src={match.awayTeam.crestUrl}
                    alt={`${match.awayTeam.name} crest`}
                    width={88}
                    height={88}
                    className="h-12 w-12 drop-shadow-lg sm:h-24 sm:w-24"
                  />
                  <p className="max-w-full truncate text-sm font-black text-zinc-950 dark:text-zinc-50 sm:text-3xl">
                    <TeamName name={match.awayTeam.name} />
                  </p>
                </div>
              </div>
            </div>

            <dl className="grid content-center gap-3 rounded-3xl border border-stone-300 bg-white/80 dark:border-zinc-800 dark:bg-zinc-950/70 p-4 text-sm sm:p-6">
              <div>
                <dt className="text-stone-600 dark:text-zinc-500"><Trans k="dateTime" /></dt>
                <dd className="mt-1 font-semibold capitalize text-zinc-900 dark:text-zinc-100">
                  <LocalizedKickoff date={match.date} kickoffTime={match.kickoffTime} kickoffAt={match.kickoffAt} />
                </dd>
              </div>
              <div>
                <dt className="text-stone-600 dark:text-zinc-500"><Trans k="stadium" /></dt>
                <dd className="mt-1 font-semibold text-zinc-900 dark:text-zinc-100">{match.venue}</dd>
              </div>
              {match.standingsContext ? (
                <div>
                  <dt className="text-stone-600 dark:text-zinc-500"><Trans k="tablePositions" /></dt>
                  <dd className="mt-1 font-semibold text-zinc-900 dark:text-zinc-100">
                    <TranslatedCompetitionName competition={match.standingsContext.label} /> · {match.standingsContext.homePosition}° vs {match.standingsContext.awayPosition}°
                  </dd>
                </div>
              ) : null}
              <div>
                <dt className="text-stone-600 dark:text-zinc-500"><Trans k="status" /></dt>
                <dd className="mt-1 font-semibold text-zinc-900 dark:text-zinc-100"><TranslatedStatus status={match.status} /></dd>
              </div>
            </dl>
          </div>
        </section>

        <nav
          className="z-20 mt-8 overflow-x-auto rounded-2xl border border-stone-300 bg-white/90 dark:border-zinc-800 dark:bg-zinc-950/90 p-2 shadow-lg shadow-stone-300/30 dark:shadow-black/30 backdrop-blur lg:sticky lg:top-4"
          aria-label="match sections"
        >
          <div className="flex min-w-max gap-2">
            {[
              { href: "#eventos", labelKey: "events" as const },
              { href: "#estadisticas", labelKey: "statistics" as const },
              { href: "#alineaciones", labelKey: "lineups" as const },
              { href: "#tabla", labelKey: "standings" as const },
            ].map(({ href, labelKey }) => (
              <a
                key={href}
                href={href}
                className="rounded-full px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:bg-stone-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
              >
                <Trans k={labelKey} />
              </a>
            ))}
          </div>
        </nav>

        <div className="mt-8 space-y-10 pb-12 lg:mt-12 lg:space-y-16">
          <div id="eventos" className="scroll-mt-24">
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-amber-700 dark:text-amber-200">
                <Trans k="minuteByMinute" />
              </p>
              <h2 className="mt-2 text-2xl font-black text-zinc-950 dark:text-zinc-50"><Trans k="matchEvents" /></h2>
            </div>
            <MatchEventsTimeline events={events} match={match} dataSource={source} />
          </div>

          <div id="estadisticas" className="scroll-mt-24">
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-amber-700 dark:text-amber-200">
                <Trans k="performance" />
              </p>
              <h2 className="mt-2 text-2xl font-black text-zinc-950 dark:text-zinc-50"><Trans k="mainStats" /></h2>
            </div>
            <MatchStats statistics={statistics} match={match} dataSource={source} />
          </div>

          <div id="alineaciones" className="scroll-mt-24">
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-amber-700 dark:text-amber-200">
                <Trans k="squads" />
              </p>
              <h2 className="mt-2 text-2xl font-black text-zinc-950 dark:text-zinc-50"><Trans k="confirmedLineups" /></h2>
            </div>
            <MatchLineups lineup={lineup} match={match} dataSource={source} />
          </div>

          {standings ? (
            <div id="tabla" className="scroll-mt-24">
              <div className="mb-4">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-amber-700 dark:text-amber-200">
                  <Trans k="context" />
                </p>
                <h2 className="mt-2 text-2xl font-black text-zinc-950 dark:text-zinc-50"><Trans k="tablePositions" /></h2>
              </div>
              <StandingsTable
                standings={standings}
                highlightedTeamIds={highlightedTeamIds}
                previewRows={4}
              />
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
