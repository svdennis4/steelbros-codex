import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { joinChapter } from "./actions";

type JoinPageProps = {
  params: Promise<{
    code: string;
  }>;
};

export default async function JoinPage({
  params,
}: JoinPageProps) {
  const { code } = await params;
  const session = await getServerSession(authOptions);

  const invite = await prisma.chapterInvite.findUnique({
    where: {
      code,
    },
    include: {
      community: {
        include: {
          gameSystem: true,
          members: true,
        },
      },
    },
  });

  if (!invite || !invite.active) {
    notFound();
  }

  const chapter = invite.community;

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <section className="mx-auto max-w-3xl px-6 py-20">
        <p className="text-xs font-bold tracking-[0.35em] text-orange-500">
          JOIN CHAPTER
        </p>

        <h1 className="mt-4 text-5xl font-black">
          {chapter.name}
        </h1>

        <p className="mt-3 text-xl text-orange-500">
          {chapter.gameSystem.name}
        </p>

        <p className="mt-6 text-zinc-500">
          {chapter.description ??
            "A community forged through battle, rivalry, and legacy."}
        </p>

        <div className="mt-10 border border-zinc-800 bg-zinc-950 p-6">
          <p className="text-xs font-bold tracking-[0.25em] text-zinc-500">
            MEMBERS
          </p>

          <p className="mt-2 text-4xl font-black text-orange-500">
            {chapter.members.length}
          </p>
        </div>

        {session?.user ? (
            <form action={joinChapter.bind(null, code)}>
                <button
                    className="mt-8 block w-full bg-orange-600 px-6 py-4 text-center font-black text-black hover:bg-orange-500"
            >
                    JOIN CHAPTER
                </button>
            </form>
            ) : (
            <Link
                href={`/api/auth/signin?callbackUrl=/join/${code}`}
                className="mt-8 block bg-orange-600 px-6 py-4 text-center font-black text-black hover:bg-orange-500"
            >
                SIGN IN TO JOIN
            </Link>
        )}
      </section>
    </main>
  );
}