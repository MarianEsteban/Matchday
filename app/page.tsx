import { MatchList } from "@/components/matches/MatchList";
import { MatchTicker } from "@/components/ticker/MatchTicker";
import { PreferenceControls, Trans } from "@/components/ui/AppPreferences";
import { getMatchesByDateWithSource } from "@/data/repositories/matches.repository";

export default async function Home() {
  const { matches: todayMatches, source: matchDataSource } = await getMatchesByDateWithSource();

  return (
    <main className="min-h-screen bg-[#fbf7ee] pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-zinc-950 dark:bg-zinc-950 dark:text-white">
      <MatchTicker matches={todayMatches} />
      <div className="mx-auto max-w-6xl px-4 py-5 sm:p-6">
        <header className="mb-6 flex items-center justify-between gap-3 sm:mb-8 sm:flex-wrap sm:gap-4">
          <h1 className="text-3xl font-bold sm:text-4xl">⚽ MatchDay</h1>
          <PreferenceControls />
        </header>

        <section className="mb-8">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold"><Trans k="todaysMatches" /></h2>
          </div>

          <MatchList matches={todayMatches} dataSource={matchDataSource} />
        </section>
      </div>
    </main>
  );
}
