import { MatchList } from "@/components/matches/MatchList";
import { getMatchesByDate } from "@/data/repositories/matches.repository";

export default function Home() {
  const todayMatches = getMatchesByDate();

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-6xl p-6">
        <h1 className="mb-8 text-4xl font-bold">⚽ MatchDay</h1>

        <section className="mb-8">
          <div className="mb-4">
            <p className="text-sm uppercase tracking-wide text-zinc-500">Primera slice</p>
            <h2 className="text-2xl font-semibold">Partidos de Hoy</h2>
          </div>

          <MatchList matches={todayMatches} />
        </section>
      </div>
    </main>
  );
}
