import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateChapter } from "./actions";
import { createChapterInvite } from "./actions";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

type Props = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    invite?: string;
  }>;
};

export default async function ChapterSettingsPage({
  params,
  searchParams,
}: Props) {
  const { slug } = await params;
  const { invite } = await searchParams;

  const chapter = await prisma.community.findUnique({
    where: {
      slug,
    },
  });

  if (!chapter) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#080808] px-6 py-12 text-white">
      <div className="mx-auto max-w-3xl">
        <SiteHeader />
        <Link
          href={`/chapters/${chapter.slug}`}
          className="text-xs font-bold tracking-[0.25em] text-zinc-500 hover:text-orange-500"
        >
          ← BACK TO CHAPTER
        </Link>
        <p className="text-sm font-bold tracking-[0.35em] text-orange-500">
          CHAPTER SETTINGS
        </p>

        <h1 className="mt-4 text-5xl font-black">
          {chapter.name}
        </h1>

        <form
          action={updateChapter.bind(null, slug)}
          className="mt-10 space-y-6 border border-zinc-800 bg-zinc-950 p-8"
        >
          <div>
            <label className="text-sm font-bold text-zinc-400">
              CHAPTER NAME
            </label>

            <input
              name="name"
              defaultValue={chapter.name}
              className="mt-2 w-full border border-zinc-700 bg-black px-4 py-3"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-zinc-400">
              DESCRIPTION
            </label>

            <textarea
              name="description"
              defaultValue={chapter.description ?? ""}
              rows={5}
              className="mt-2 w-full border border-zinc-700 bg-black px-4 py-3"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-zinc-400">
              LOGO URL
            </label>

            <input
              name="logoUrl"
              defaultValue={chapter.logoUrl ?? ""}
              className="mt-2 w-full border border-zinc-700 bg-black px-4 py-3"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-zinc-400">
              BANNER URL
            </label>

            <input
              name="bannerUrl"
              defaultValue={chapter.bannerUrl ?? ""}
              className="mt-2 w-full border border-zinc-700 bg-black px-4 py-3"
            />
          </div>

          <button
            className="w-full bg-orange-600 py-4 font-black text-black hover:bg-orange-500"
          >
            SAVE CHANGES
          </button>
        </form>
        <section className="mt-10 border border-zinc-800 bg-zinc-950 p-6">
          <p className="text-xs font-bold tracking-[0.25em] text-orange-500">
            MEMBER INVITE
          </p>

          <h2 className="mt-3 text-2xl font-black">
            Grow Your Chapter
          </h2>

          <p className="mt-3 text-zinc-500">
            Share this link with players you want to invite.
          </p>

          {invite ? (
            <div className="mt-6 border border-zinc-700 bg-black p-4">
              <p className="break-all text-sm text-zinc-300">
                {`${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/join/${invite}`}
              </p>
            </div>
          ) : (
            <form action={createChapterInvite.bind(null, slug)}>
              <button
                className="mt-6 w-full bg-orange-600 px-5 py-4 font-black text-black hover:bg-orange-500"
              >
                GENERATE INVITE LINK
              </button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}