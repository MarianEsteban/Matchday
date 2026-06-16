export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-6xl p-6">
        <h1 className="text-4xl font-bold mb-8">
          ⚽ MatchDay
        </h1>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            Partidos de Hoy
          </h2>

          <div className="rounded-lg bg-zinc-900 p-4">
            Boca Juniors vs Racing
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            Próximos Partidos
          </h2>

          <div className="rounded-lg bg-zinc-900 p-4">
            River Plate vs Independiente
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            Tabla de Posiciones
          </h2>

          <div className="rounded-lg bg-zinc-900 p-4">
            1. Boca Juniors
          </div>
        </section>
      </div>
    </main>
  );
}