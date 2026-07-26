import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import SignOutButton from "@/components/SignOutButton";

export default async function Home() {
  const session = await getServerSession(authOptions);

  const chapterMemberships = session?.user?.id
  ? await prisma.communityMember.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        community: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    })
  : [];

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      {/* Navigation */}
      <header className="border-b border-zinc-800 bg-black/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="text-2xl font-black tracking-[0.18em] text-orange-500"
          >
            IRONBOUND
          </Link>

            <nav className="hidden items-center gap-8 text-sm font-semibold tracking-wider text-zinc-400 md:flex">
              <Link href="/chapters" className="hover:text-orange-500">
               CHAPTERS
               </Link>

              <Link href="/how-it-works" className="hover:text-orange-500">
               HOW IT WORKS
            </Link>

             <Link href="/about" className="hover:text-orange-500">
                ABOUT
              </Link>
            </nav>

          {session?.user ? (
            <div className="flex items-center gap-4">
              {session.user.image && (
                <img
                  src={session.user.image}
                  alt={session.user.name ?? "Ironbound user"}
                  className="h-10 w-10 rounded-full border border-orange-500"
                />
              )}

              <span className="hidden text-sm font-semibold text-zinc-300 sm:block">
                {session.user.name}
              </span>

              <SignOutButton />
            </div>
          ) : (
            <Link
              href="/api/auth/signin"
              className="border border-orange-500 px-5 py-2 text-sm font-bold tracking-wider text-orange-500 transition hover:bg-orange-500 hover:text-black"
            >
              SIGN IN
            </Link>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-zinc-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,88,12,0.15),transparent_45%)]" />

        <div className="relative mx-auto max-w-7xl px-6 py-28 text-center">
          <p className="mb-4 text-sm font-bold tracking-[0.4em] text-orange-500">
            COMMUNITY • RIVALRY • LEGACY
          </p>

          <h1 className="text-6xl font-black tracking-tight sm:text-7xl md:text-8xl">
            IRONBOUND
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-xl leading-8 text-zinc-400">
            Build your community. Record your battles. Forge rivalries and
            become part of your Chapter&apos;s history.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/chapters"
              className="bg-orange-600 px-8 py-4 font-black tracking-wider text-black transition hover:bg-orange-500"
            >
              FIND A CHAPTER
            </Link>

            <Link
              href="/chapters/create"
              className="border border-zinc-700 px-8 py-4 font-black tracking-wider transition hover:border-orange-500 hover:text-orange-500"
            >
              CREATE A CHAPTER
            </Link>
          </div>
        </div>
      </section>

      {/* Signed-in dashboard preview */}
      {session?.user && (
        <section className="mx-auto max-w-7xl px-6 py-16">
  <div className="mb-8">
    <p className="text-sm font-bold tracking-[0.3em] text-orange-500">
      WELCOME BACK
    </p>

    <h2 className="mt-2 text-4xl font-black">
      {session?.user?.name}
    </h2>
  </div>

  <div className="flex items-end justify-between gap-6">
    <div>
      <h3 className="text-2xl font-black">YOUR CHAPTERS</h3>
      <p className="mt-2 text-zinc-500">
        The communities you belong to on Ironbound.
      </p>
    </div>

    <Link
      href="/chapters"
      className="text-sm font-bold tracking-wider text-orange-500 hover:text-orange-400"
    >
      VIEW ALL CHAPTERS
    </Link>
  </div>

  {chapterMemberships.length > 0 ? (
    <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {chapterMemberships.map((membership) => (
        <Link
          key={membership.id}
          href={`/chapters/${membership.community.slug}`}
          className="group border border-zinc-800 bg-zinc-950 p-6 transition hover:border-orange-500"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-[0.25em] text-orange-500">
                {membership.role}
              </p>

              <h4 className="mt-2 text-2xl font-black">
                {membership.community.name}
              </h4>
            </div>

            <span className="text-zinc-600 transition group-hover:text-orange-500">
              →
            </span>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 border-t border-zinc-800 pt-6">
            <div>
              <p className="text-xs tracking-wider text-zinc-600">
                OVERALL ELO
              </p>
              <p className="mt-1 text-xl font-black">
                {membership.lifetimeElo}
              </p>
            </div>

            <div>
              <p className="text-xs tracking-wider text-zinc-600">
                RECORD
              </p>
              <p className="mt-1 text-xl font-black">
                {membership.lifetimeWins}-{membership.lifetimeLosses}-
                {membership.lifetimeDraws}
              </p>
            </div>
          </div>

          <p className="mt-6 text-sm font-bold tracking-wider text-zinc-500 group-hover:text-orange-500">
            ENTER CHAPTER
          </p>
        </Link>
      ))}
    </div>
  ) : (
    <div className="mt-8 border border-zinc-800 bg-zinc-950 p-8">
      <h4 className="text-xl font-black">NO CHAPTERS YET</h4>

      <p className="mt-2 text-zinc-500">
        Find an existing Chapter or create one of your own.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/chapters"
          className="border border-zinc-700 px-5 py-3 text-sm font-bold hover:border-orange-500 hover:text-orange-500"
        >
          FIND A CHAPTER
        </Link>

        <Link
          href="/chapters/create"
          className="bg-orange-600 px-5 py-3 text-sm font-bold text-black hover:bg-orange-500"
        >
          CREATE A CHAPTER
        </Link>
      </div>
    </div>
  )}
</section>
      )}

      {/* Product pillars */}
      <section className="border-t border-zinc-900 bg-black">
        <div className="mx-auto grid max-w-7xl gap-px bg-zinc-900 md:grid-cols-3">
          <div className="bg-black p-10">
            <p className="text-sm font-bold tracking-widest text-orange-500">
              RECORD
            </p>

            <h3 className="mt-3 text-2xl font-black">Every Battle Matters</h3>

            <p className="mt-4 leading-7 text-zinc-500">
              Track matches, factions, records, Elo, and the battles that shape
              your Chapter.
            </p>
          </div>

          <div className="bg-black p-10">
            <p className="text-sm font-bold tracking-widest text-orange-500">
              COMPETE
            </p>

            <h3 className="mt-3 text-2xl font-black">Build Rivalries</h3>

            <p className="mt-4 leading-7 text-zinc-500">
              Seasonal rankings turn everyday games into ongoing competition
              without requiring a tournament.
            </p>
          </div>

          <div className="bg-black p-10">
            <p className="text-sm font-bold tracking-widest text-orange-500">
              REMEMBER
            </p>

            <h3 className="mt-3 text-2xl font-black">Leave a Legacy</h3>

            <p className="mt-4 leading-7 text-zinc-500">
              Champions, records, achievements, and rivalries become permanent
              parts of your community&apos;s history.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}