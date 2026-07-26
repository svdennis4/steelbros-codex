import { prisma } from "@/lib/prisma";
import { createChapter } from "./actions";

export default async function CreateChapterPage() {
  const gameSystems = await prisma.gameSystem.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <section className="mx-auto max-w-3xl px-6 py-16">
        <div>
          <p className="text-sm font-bold tracking-[0.35em] text-orange-500">
            CHAPTER CREATION
          </p>

          <h1 className="mt-4 text-5xl font-black">
            Forge Your Chapter
          </h1>

          <p className="mt-4 max-w-xl text-zinc-500">
            Create a home for your community, track battles,
            build rivalries, and leave a legacy.
          </p>
        </div>

        <form
          action={createChapter}
          className="mt-12 space-y-8 border border-zinc-800 bg-zinc-950 p-8"
        >
          <div>
            <label className="text-sm font-bold tracking-wider text-zinc-400">
              CHAPTER NAME
            </label>

            <input
              name="name"
              type="text"
              placeholder="SteelBros Gaming"
              required
              className="mt-3 w-full border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="text-sm font-bold tracking-wider text-zinc-400">
              GAME SYSTEM
            </label>

            <select
              name="gameSystemId"
              required
              className="mt-3 w-full border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-orange-500"
            >
              <option value="">
                Select a game system
              </option>

              {gameSystems.map((system) => (
                <option
                  key={system.id}
                  value={system.id}
                >
                  {system.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-bold tracking-wider text-zinc-400">
              DESCRIPTION
            </label>

            <textarea
              name="description"
              placeholder="Tell your community's story..."
              rows={5}
              className="mt-3 w-full border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-orange-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-orange-600 px-6 py-4 font-black tracking-wider text-black transition hover:bg-orange-500"
          >
            CREATE CHAPTER
          </button>
        </form>
      </section>
    </main>
  );
}