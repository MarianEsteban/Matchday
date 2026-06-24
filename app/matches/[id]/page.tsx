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
import { getLineupsByMatchId } from "@/data/mock/lineups";
import { getMatchEventsByMatchId } from "@/data/mock/match-events";
import { getMatchStatisticsByMatchId } from "@/data/mock/match-statistics";
import { getStandingsByCompetition } from "@/data/mock/standings";
import { getMatchById } from "@/data/repositories/matches.repository";
import type { MatchStatus } from "@/types/match";

type MatchDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const statusBadgeStyles: Record<MatchStatus, string> = {
  scheduled: "border-sky-500/20 bg-sky-500/10 text-sky-200",
  live: "border-emerald-400/30 bg-emerald-400/15 text-emerald-200",
  finished: "border-zinc-600/40 bg-zinc-800 text-zinc-300",
};

export default async function MatchDetailPage({ params }: MatchDetailPageProps) {
  const { id } = await params;
  const match = await getMatchById(id);

  if (!match) {
    notFound();
  }

  const standings = getStandingsByCompetition(match.competition);
  const events = getMatchEventsByMatchId(match.id);
  const statistics = getMatchStatisticsByMatchId(match.id);
  const lineup = getLineupsByMatchId(match.id);
  const highlightedTeamIds = [match.homeTeam.id, match.awayTeam.id];

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 lg:mb-8">
        <Link
          href="/"
          className="inline-flex rounded-full border border-zinc-800 px-4 py-2 text-sm font-semibold text-zinc-300 transition-colors hover:border-zinc-600 hover:bg-zinc-900 hover:text-white"
        >
          ← <Trans k="backToMatches" />
        </Link>
        <PreferenceControls />
        </div>

        <section className="overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-900/90 shadow-2xl shadow-black/40">
          <div className="border-b border-zinc-800 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.14),transparent_34%),linear-gradient(135deg,rgba(39,39,42,0.96),rgba(9,9,11,0.96))] p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-wide text-amber-200">
                  <TranslatedCompetitionName competition={match.competition} />
                </p>
                <h1 className="mt-3 text-3xl font-bold text-zinc-50 sm:text-5xl">
                  {match.homeTeam.name} vs {match.awayTeam.name}
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

          <div className="grid gap-6 p-5 sm:p-8 lg:grid-cols-[1.6fr_0.9fr]">
            <div className="relative overflow-hidden rounded-3xl border border-amber-300/20 bg-zinc-950 p-6 text-center shadow-2xl shadow-amber-950/20 sm:p-8">
              <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-amber-200/70 to-transparent" />
              <p className="mb-6 text-xs font-bold uppercase tracking-[0.35em] text-zinc-500">
                <Trans k="score" />
              </p>
              <div className="grid items-center gap-5 sm:grid-cols-[1fr_auto_1fr]">
                <div className="flex flex-col items-center gap-4">
                  <Image
                    src={match.homeTeam.crestUrl}
                    alt={`${match.homeTeam.name} crest`}
                    width={88}
                    height={88}
                    className="h-20 w-20 drop-shadow-lg sm:h-24 sm:w-24"
                  />
                  <p className="text-2xl font-black text-zinc-50 sm:text-3xl">
                    {match.homeTeam.name}
                  </p>
                </div>
                <div className="rounded-[1.75rem] border border-amber-300/30 bg-gradient-to-b from-zinc-800 to-zinc-950 px-7 py-5 text-5xl font-black tracking-tight text-zinc-50 shadow-inner shadow-black/60 sm:px-9 sm:py-6 sm:text-6xl">
                  {match.score ? `${match.score.home} - ${match.score.away}` : "vs"}
                </div>
                <div className="flex flex-col items-center gap-4">
                  <Image
                    src={match.awayTeam.crestUrl}
                    alt={`${match.awayTeam.name} crest`}
                    width={88}
                    height={88}
                    className="h-20 w-20 drop-shadow-lg sm:h-24 sm:w-24"
                  />
                  <p className="text-2xl font-black text-zinc-50 sm:text-3xl">
                    {match.awayTeam.name}
                  </p>
                </div>
              </div>
            </div>

            <dl className="grid content-center gap-5 rounded-3xl border border-zinc-800 bg-zinc-950/70 p-6 text-sm">
              <div>
                <dt className="text-zinc-500"><Trans k="dateTime" /></dt>
                <dd className="mt-1 font-semibold capitalize text-zinc-100">
                  <LocalizedKickoff date={match.date} kickoffTime={match.kickoffTime} />
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500"><Trans k="stadium" /></dt>
                <dd className="mt-1 font-semibold text-zinc-100">{match.venue}</dd>
              </div>
              <div>
                <dt className="text-zinc-500"><Trans k="status" /></dt>
                <dd className="mt-1 font-semibold text-zinc-100"><TranslatedStatus status={match.status} /></dd>
              </div>
            </dl>
          </div>
        </section>

        <nav
          className="z-20 mt-8 overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950/90 p-2 shadow-lg shadow-black/30 backdrop-blur lg:sticky lg:top-4"
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
                className="rounded-full px-4 py-2 text-sm font-semibold text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
              >
                <Trans k={labelKey} />
              </a>
            ))}
          </div>
        </nav>

        <div className="mt-10 space-y-12 pb-12 lg:mt-12 lg:space-y-16">
          <div id="eventos" className="scroll-mt-24">
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-amber-200">
                <Trans k="minuteByMinute" />
              </p>
              <h2 className="mt-2 text-2xl font-black text-zinc-50"><Trans k="matchEvents" /></h2>
            </div>
            <MatchEventsTimeline events={events} match={match} />
          </div>

          <div id="estadisticas" className="scroll-mt-24">
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-amber-200">
                <Trans k="performance" />
              </p>
              <h2 className="mt-2 text-2xl font-black text-zinc-50"><Trans k="mainStats" /></h2>
            </div>
            <MatchStats statistics={statistics} match={match} />
          </div>

          <div id="alineaciones" className="scroll-mt-24">
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-amber-200">
                <Trans k="squads" />
              </p>
              <h2 className="mt-2 text-2xl font-black text-zinc-50"><Trans k="confirmedLineups" /></h2>
            </div>
            <MatchLineups lineup={lineup} match={match} />
          </div>

          {standings ? (
            <div id="tabla" className="scroll-mt-24">
              <div className="mb-4">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-amber-200">
                  <Trans k="context" />
                </p>
                <h2 className="mt-2 text-2xl font-black text-zinc-50"><Trans k="tablePositions" /></h2>
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
