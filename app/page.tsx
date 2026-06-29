import { HomeMatches } from "@/components/matches/HomeMatches";
import { getMatchesByDateWithSource } from "@/data/repositories/matches.repository";
import { formatDateKey } from "@/lib/match-date";

export default async function Home() {
  const selectedDateKey = formatDateKey(new Date());
  const { matches: todayMatches, source: matchDataSource } = await getMatchesByDateWithSource(new Date());

  return (
    <main className="min-h-screen bg-[#fbf7ee] pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-zinc-950 dark:bg-zinc-950 dark:text-white">
      <HomeMatches initialMatches={todayMatches} initialDataSource={matchDataSource} initialSelectedDateKey={selectedDateKey} />
    </main>
  );
}
