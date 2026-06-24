import { MatchList } from "@/components/matches/MatchList";
import { MatchTicker } from "@/components/ticker/MatchTicker";
import { PreferenceControls, Trans } from "@/components/ui/AppPreferences";
import { getMatchesByDate } from "@/data/repositories/matches.repository";

export default async function Home() {
  const todayMatches = await getMatchesByDate();

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <MatchTicker matches={todayMatches} />
      <div className="mx-auto max-w-6xl p-6">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-4xl font-bold">⚽ MatchDay</h1>
          <PreferenceControls />
        </header>

        <section className="mb-8">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold"><Trans k="todaysMatches" /></h2>
          </div>

          <MatchList matches={todayMatches} />
        </section>
      </div>
    </main>
  );
}
