import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MatchEventsTimeline } from "@/components/matches/MatchEventsTimeline";
import { MatchLineups } from "@/components/matches/MatchLineups";
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

const statusLabels: Record<MatchStatus, string> = {
  scheduled: "Próximo",
  live: "En vivo",
  finished: "Finalizado",
};

const statusBadgeStyles: Record<MatchStatus, string> = {
  scheduled: "border-sky-500/20 bg-sky-500/10 text-sky-200",
  live: "border-emerald-400/30 bg-emerald-400/15 text-emerald-200",
  finished: "border-zinc-600/40 bg-zinc-800 text-zinc-300",
};

function formatKickoff(date: string, kickoffTime: string) {
  return new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(`${date}T${kickoffTime}:00`));
}

export default async function MatchDetailPage({ params }: MatchDetailPageProps) {
  const { id } = await params;
  const match = getMatchById(id);

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
      <div className="mx-auto max-w-5xl p-6">
        <Link
          href="/"
          className="mb-6 inline-flex rounded-full border border-zinc-800 px-4 py-2 text-sm font-semibold text-zinc-300 transition-colors hover:border-zinc-600 hover:bg-zinc-900 hover:text-white"
        >
          ← Volver a partidos
        </Link>

        <section className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/90 shadow-xl shadow-black/30">
          <div className="border-b border-zinc-800 bg-zinc-950/60 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-wide text-amber-200">
                  {match.competition}
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
                {statusLabels[match.status]}
              </span>
            </div>
          </div>

          <div className="grid gap-6 p-6 lg:grid-cols-[1.4fr_1fr]">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6 text-center">
              <div className="grid items-center gap-4 sm:grid-cols-[1fr_auto_1fr]">
                <div className="flex flex-col items-center gap-3">
                  <Image
                    src={match.homeTeam.crestUrl}
                    alt={`${match.homeTeam.name} crest`}
                    width={64}
                    height={64}
                    className="h-16 w-16"
                  />
                  <p className="text-2xl font-bold text-zinc-50">{match.homeTeam.name}</p>
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 px-5 py-4 text-3xl font-black text-zinc-50">
                  {match.score ? `${match.score.home} - ${match.score.away}` : "vs"}
                </div>
                <div className="flex flex-col items-center gap-3">
                  <Image
                    src={match.awayTeam.crestUrl}
                    alt={`${match.awayTeam.name} crest`}
                    width={64}
                    height={64}
                    className="h-16 w-16"
                  />
                  <p className="text-2xl font-bold text-zinc-50">{match.awayTeam.name}</p>
                </div>
              </div>
            </div>

            <dl className="grid gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6 text-sm">
              <div>
                <dt className="text-zinc-500">Fecha y hora</dt>
                <dd className="mt-1 font-semibold capitalize text-zinc-100">
                  {formatKickoff(match.date, match.kickoffTime)}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500">Estadio</dt>
                <dd className="mt-1 font-semibold text-zinc-100">{match.venue}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Estado</dt>
                <dd className="mt-1 font-semibold text-zinc-100">{statusLabels[match.status]}</dd>
              </div>
            </dl>
          </div>
        </section>

        <nav
          className="mt-8 overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900/80 p-2 shadow-sm shadow-black/20"
          aria-label="Secciones del partido"
        >
          <div className="flex min-w-max gap-2">
            {[
              ["#eventos", "Eventos"],
              ["#estadisticas", "Estadísticas"],
              ["#alineaciones", "Alineaciones"],
              ["#tabla", "Tabla"],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="rounded-full px-4 py-2 text-sm font-semibold text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
              >
                {label}
              </a>
            ))}
          </div>
        </nav>

        <div className="mt-8 space-y-8">
          <div id="eventos" className="scroll-mt-6">
            <MatchEventsTimeline events={events} match={match} />
          </div>

          <div id="estadisticas" className="scroll-mt-6">
            <MatchStats statistics={statistics} match={match} />
          </div>

          <div id="alineaciones" className="scroll-mt-6">
            <MatchLineups lineup={lineup} match={match} />
          </div>

          {standings ? (
            <div id="tabla" className="scroll-mt-6">
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
