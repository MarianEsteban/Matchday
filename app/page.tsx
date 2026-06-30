import { HomeMatches } from "@/components/matches/HomeMatches";
import { getMatchesByDateWithSource } from "@/data/repositories/matches.repository";
import { formatDateKey } from "@/lib/match-date";

export default async function Home() {
  const selectedDateKey = formatDateKey(new Date());
  const { matches: todayMatches, source: matchDataSource, metadata } = await getMatchesByDateWithSource(new Date());

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_28rem),linear-gradient(180deg,#fbfaf5,#f0eee7)] pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-zinc-950 dark:bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_26rem),linear-gradient(180deg,#09090b,#0a0a0a)] dark:text-white">
      <HomeMatches initialMatches={todayMatches} initialDataSource={matchDataSource} initialMetadata={metadata} initialSelectedDateKey={selectedDateKey} />
    </main>
  );
}
