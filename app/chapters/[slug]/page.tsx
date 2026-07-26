import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

type ChapterPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ChapterPage({
  params,
}: ChapterPageProps) {
  const { slug } = await params;

  const session = await getServerSession(authOptions);

  const chapter = await prisma.community.findUnique({
    where: {
      slug,
    },
    include: {
      gameSystem: true,
      members: {
        include: {
          user: true,
        },
        orderBy: {
          lifetimeElo: "desc",
        },
      },
      seasons: {
        orderBy: {
          startDate: "desc",
        },
      },
      matches: {
        where: {
          status: "CONFIRMED",
        },
        orderBy: {
          playedAt: "desc",
        },
        take: 5,
      },
    },
  });

  if (!chapter) {
    notFound();
  }

  const isOwner = chapter.members.some(
  (member) =>
    member.userId === session?.user?.id &&
    member.role === "OWNER",
);

  const activeSeason = chapter.seasons.find(
    (season) => season.isActive,
  );

  return (
    <main className="min-h-screen bg-[#080808] text-white">
    {/* Chapter Banner */}
    <div
       className="h-48 border-b border-zinc-800 bg-gradient-to-r from-orange-950 via-black to-black"
      />
    {/* Chapter Header */}
    <header className="border-b border-zinc-800 bg-black">
      <div className="mx-auto max-w-7xl px-6 py-6">
        <Link
          href="/"
          className="text-sm font-bold tracking-[0.3em] text-orange-500"
        >
          IRONBOUND
        </Link>

        <div className="mt-5 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-bold tracking-[0.35em] text-zinc-500">
              CHAPTER
            </p>

            <h1 className="mt-2 text-4xl font-black tracking-tight md:text-6xl">
              {chapter.name}
            </h1>

            <p className="mt-3 text-lg font-bold text-orange-500">
              {chapter.gameSystem.name} Chapter
            </p>

            {chapter.description && (
              <p className="mt-4 max-w-2xl text-zinc-400">
                {chapter.description}
              </p>
            )}
          </div>

          <div className="text-left md:text-right">
            <p className="text-xs font-bold tracking-[0.25em] text-zinc-600">
              CURRENT SEASON
            </p>

            <p className="mt-2 text-xl font-black text-orange-500">
              {activeSeason?.name ?? "No Active Season"}
            </p>
          </div>
        </div>
      </div>
    </header>

      {/* Chapter Navigation */}
      <nav className="border-b border-zinc-800 bg-zinc-950">
        <div className="mx-auto flex max-w-7xl gap-8 overflow-x-auto px-6 py-4 text-sm font-bold tracking-wider text-zinc-400">
          <Link href={`/chapters/${chapter.slug}`} className="text-orange-500">
            HOME
          </Link>

          <Link href={`/chapters/${chapter.slug}/battles`}>
            BATTLES
          </Link>

          <Link href={`/chapters/${chapter.slug}/standings`}>
            STANDINGS
          </Link>

          <Link href={`/chapters/${chapter.slug}/seasons`}>
            SEASONS
          </Link>

          <Link href={`/chapters/${chapter.slug}/members`}>
            MEMBERS
          </Link>

          <Link href={`/chapters/${chapter.slug}/hall-of-legends`}>
            HALL OF LEGENDS
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-xs font-bold tracking-[0.25em] text-zinc-600">
              MEMBERS
            </p>

            <p className="mt-3 text-4xl font-black text-orange-500">
              {chapter.members.length}
            </p>
          </div>

          <div className="border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-xs font-bold tracking-[0.25em] text-zinc-600">
              CONFIRMED BATTLES
            </p>

            <p className="mt-3 text-4xl font-black text-orange-500">
              {chapter.matches.length}
            </p>
          </div>

          <div className="border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-xs font-bold tracking-[0.25em] text-zinc-600">
              CHAPTER LEADER
            </p>

            <p className="mt-3 text-xl font-black">
              {chapter.members[0]?.displayName ??
                chapter.members[0]?.user.displayName ??
                chapter.members[0]?.user.discordUsername ??
                "—"}
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          {/* Standings Preview */}
          <section className="border border-zinc-800 bg-zinc-950 lg:col-span-2">
            <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-5">
              <h2 className="text-xl font-black">STANDINGS</h2>

              <Link
                href={`/chapters/${chapter.slug}/standings`}
                className="text-xs font-bold tracking-wider text-orange-500"
              >
                VIEW ALL
              </Link>
            </div>

            {chapter.members.length > 0 ? (
              <div>
                {chapter.members.slice(0, 5).map((member, index) => (
                  <div
                    key={member.id}
                    className="grid grid-cols-[50px_1fr_100px_100px] items-center border-b border-zinc-900 px-6 py-4 last:border-b-0"
                  >
                    <span className="font-black text-zinc-600">
                      #{index + 1}
                    </span>

                    <span className="font-bold">
                      {member.displayName ??
                        member.user.displayName ??
                        member.user.discordUsername}
                    </span>

                    <span className="text-right font-black">
                      {member.lifetimeElo}
                    </span>

                    <span className="text-right text-sm text-zinc-500">
                      {member.lifetimeWins}-{member.lifetimeLosses}-
                      {member.lifetimeDraws}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="p-6 text-zinc-500">
                No members have joined this Chapter yet.
              </p>
            )}
          </section>

          {/* Chapter Actions */}
          <aside className="border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-xs font-bold tracking-[0.25em] text-orange-500">
              CHAPTER ACTIONS
            </p>

            <h2 className="mt-3 text-2xl font-black">
              Ready for Battle?
            </h2>

            <p className="mt-3 leading-7 text-zinc-500">
              Record your games and build the competitive history of your
              Chapter.
            </p>

            <Link
              href={`/chapters/${chapter.slug}/battles/new`}
              className="mt-6 block bg-orange-600 px-5 py-4 text-center font-black tracking-wider text-black hover:bg-orange-500"
            >
              RECORD A BATTLE
            </Link>
          {isOwner && (
            <Link
              href={`/chapters/${chapter.slug}/settings`}
              className="mt-4 block border border-zinc-700 px-5 py-4 text-center font-black tracking-wider text-white hover:border-orange-500 hover:text-orange-500"
              >
              MANAGE CHAPTER
            </Link>
          )}
          </aside>
        </div>

        {/* Recent Battles */}
        <section className="mt-8 border border-zinc-800 bg-zinc-950">
          <div className="border-b border-zinc-800 px-6 py-5">
            <h2 className="text-xl font-black">RECENT BATTLES</h2>
          </div>

          {chapter.matches.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-lg font-bold">NO BATTLES RECORDED</p>

              <p className="mt-2 text-zinc-500">
                The history of {chapter.name} begins with its first battle.
              </p>
            </div>
          ) : (
            <div className="p-6">
              <p className="text-zinc-500">
                Recent confirmed battles will appear here.
              </p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}