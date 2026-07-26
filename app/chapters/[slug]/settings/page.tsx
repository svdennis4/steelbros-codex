import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateChapter } from "./actions";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ChapterSettingsPage({
  params,
}: Props) {
  const { slug } = await params;

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
      </div>
    </main>
  );
}