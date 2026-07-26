import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

type MembersPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function MembersPage({
  params,
}: MembersPageProps) {
  const { slug } = await params;

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
    },
  });

  if (!chapter) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#080808] px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <Link
            href={`/chapters/${chapter.slug}`}
            className="text-xs font-bold tracking-[0.25em] text-zinc-500 hover:text-orange-500"
        >   
         ← BACK TO CHAPTER
        </Link>


        <p className="text-sm font-bold tracking-[0.35em] text-orange-500">
          MEMBERS
        </p>
        <h1 className="mt-4 text-5xl font-black">
          {chapter.name}
        </h1>

        <p className="mt-2 text-zinc-500">
          {chapter.gameSystem.name}
        </p>

        <section className="mt-10 border border-zinc-800 bg-zinc-950">
          <div className="border-b border-zinc-800 px-6 py-5">
            <h2 className="text-xl font-black">
              CHAPTER ROSTER
            </h2>
          </div>

          {chapter.members.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">
              No members have joined this Chapter yet.
            </div>
          ) : (
            chapter.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between border-b border-zinc-900 px-6 py-5 last:border-b-0"
              >
                <div className="flex items-center gap-4">
                    {member.user.avatarUrl ? (
                        <img
                        src={member.user.avatarUrl}
                        alt=""
                        className="h-12 w-12 rounded-full border border-zinc-700"
                        />
                    ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-sm font-black">
                        ?
                        </div>
                    )}

                    <div>
                        <p className="font-black">
                        {member.displayName ??
                            member.user.displayName ??
                            member.user.discordUsername}
                        </p>

                        <p className="mt-1 text-sm text-zinc-500">
                            {member.role}
                        </p>

                        <p className="mt-1 text-xs text-zinc-600">
                            Joined{" "}
                            {member.joinedAt.toLocaleDateString("en-US", {
                                month: "short",
                                year: "numeric",
                            })}
                        </p>
                    </div>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-black text-orange-500">
                    {member.lifetimeElo}
                  </p>

                  <p className="text-sm text-zinc-500">
                    {member.lifetimeWins}-
                    {member.lifetimeLosses}-
                    {member.lifetimeDraws}
                  </p>
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </main>
  );
}