import Link from "next/link";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import PlayerMenu from "@/components/PlayerMenu";

export default async function SiteHeader() {
  const session = await getServerSession(authOptions);

  return (
    <header className="border-b border-zinc-800 bg-black">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="text-sm font-black tracking-[0.35em] text-orange-500"
          >
            IRONBOUND
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/chapters"
              className="text-xs font-bold tracking-wider text-zinc-400 hover:text-orange-500"
            >
              CHAPTERS
            </Link>

            <Link
              href="/battles/new"
              className="text-xs font-bold tracking-wider text-zinc-400 hover:text-orange-500"
            >
              RECORD BATTLE
            </Link>
    
            <Link
              href="/leaderboards"
              className="text-xs font-bold tracking-wider text-zinc-400 hover:text-orange-500"
            >
              PLAYER
            </Link> 
          </nav>
        </div>

        {session?.user ? (
          <PlayerMenu user={session.user} />
        ) : (
          <Link
            href="/api/auth/signin/discord?callbackUrl=/"
            className="border border-orange-500 px-4 py-2 text-xs font-black tracking-wider text-orange-500 hover:bg-orange-500 hover:text-black"
          >
            SIGN IN WITH DISCORD
          </Link>
        )}
      </div>
    </header>
  );
}