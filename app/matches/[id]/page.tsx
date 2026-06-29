import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MatchCenterTabs } from "@/components/matches/MatchCenterTabs";
import { PreferenceControls, Trans } from "@/components/ui/AppPreferences";
import { BrandLockup } from "@/components/ui/BrandLockup";
import { LocalizedKickoff } from "@/components/ui/LocalizedKickoff";
import { TeamName } from "@/components/ui/TeamName";
import { TranslatedCompetitionName } from "@/components/ui/TranslatedCompetitionName";
import { TranslatedStatus } from "@/components/ui/TranslatedStatus";
import { getMatchDetailsById } from "@/data/repositories/matches.repository";
import type { MatchStatus } from "@/types/match";

type MatchDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const statusBadgeStyles: Record<MatchStatus, string> = {
  scheduled: "border-sky-600/25 bg-sky-100 text-sky-800 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200",
  live: "border-emerald-600/25 bg-emerald-100 text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-400/15 dark:text-emerald-200",
  finished: "border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-zinc-600/40 dark:bg-zinc-800 dark:text-zinc-300",
};

export default async function MatchDetailPage({ params }: MatchDetailPageProps) {
  const { id } = await params;
  const details = await getMatchDetailsById(id);

  if (!details) {
    notFound();
  }

  const { match } = details;
  const round = match.apiFootball?.round;
  const scoreText = match.score ? `${match.score.home} - ${match.score.away}` : "vs";

  return (
    <main className="min-h-screen bg-[#fbf7ee] pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-zinc-950 dark:bg-zinc-950 dark:text-white">
      <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 lg:py-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 lg:mb-5">
          <div className="flex flex-wrap items-center gap-3">
            <BrandLockup href="/" compact />
            <Link
              href="/"
              className="inline-flex rounded-full border border-stone-300 bg-white/80 px-4 py-2 text-sm font-semibold text-zinc-800 shadow-sm transition-colors hover:border-stone-500 hover:bg-white hover:text-zinc-950 dark:border-zinc-800 dark:bg-transparent dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-900 dark:hover:text-white"
            >
              ← <Trans k="backToMatches" />
            </Link>
          </div>
          <PreferenceControls />
        </div>

        <section className="overflow-hidden rounded-[1.75rem] border border-stone-300 bg-white/95 shadow-xl shadow-stone-300/25 dark:border-zinc-800 dark:bg-zinc-900/90 dark:shadow-black/35">
          <div className="border-b border-stone-200 bg-stone-50/80 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/45 sm:px-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-xs font-black uppercase tracking-[0.18em] text-amber-700 dark:text-amber-200">
                  <TranslatedCompetitionName competition={match.competition} />{round ? <span className="text-stone-500 dark:text-zinc-500"> · {round}</span> : null}
                </p>
                <p className="mt-1 truncate text-xs font-semibold text-stone-600 dark:text-zinc-400">
                  <LocalizedKickoff date={match.date} kickoffTime={match.kickoffTime} kickoffAt={match.kickoffAt} />{match.venue ? <> · {match.venue}</> : null}
                </p>
              </div>
              <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wide ${statusBadgeStyles[match.status]}`}>
                {match.status === "live" ? <span className="mr-2 h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_3px_rgba(52,211,153,0.18)]" /> : null}
                <TranslatedStatus status={match.status} />
              </span>
            </div>
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 px-3 py-5 sm:gap-5 sm:px-6 sm:py-6">
            <div className="flex min-w-0 flex-col items-center gap-2 text-center sm:flex-row sm:text-left">
              <Image src={match.homeTeam.crestUrl} alt={`${match.homeTeam.name} crest`} width={56} height={56} className="h-12 w-12 shrink-0 drop-shadow-sm sm:h-14 sm:w-14" />
              <p className="max-w-full truncate text-sm font-black text-zinc-950 dark:text-zinc-50 sm:text-lg"><TeamName name={match.homeTeam.name} /></p>
            </div>

            <div className="min-w-[5.5rem] rounded-2xl border border-stone-200 bg-zinc-950 px-3 py-2 text-center text-3xl font-black tracking-tight text-white shadow-inner dark:border-zinc-700 dark:bg-white dark:text-zinc-950 sm:min-w-[7rem] sm:px-5 sm:text-4xl">
              {match.status === "scheduled" && !match.score ? <span className="text-2xl sm:text-3xl">{match.kickoffTime}</span> : scoreText}
            </div>

            <div className="flex min-w-0 flex-col-reverse items-center gap-2 text-center sm:flex-row sm:justify-end sm:text-right">
              <p className="max-w-full truncate text-sm font-black text-zinc-950 dark:text-zinc-50 sm:text-lg"><TeamName name={match.awayTeam.name} /></p>
              <Image src={match.awayTeam.crestUrl} alt={`${match.awayTeam.name} crest`} width={56} height={56} className="h-12 w-12 shrink-0 drop-shadow-sm sm:h-14 sm:w-14" />
            </div>
          </div>
        </section>

        <MatchCenterTabs {...details} />
      </div>
    </main>
  );
}
