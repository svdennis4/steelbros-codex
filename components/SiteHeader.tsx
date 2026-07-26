import Link from "next/link";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";

export default async function SiteHeader() {
  const session = await getServerSession(authOptions);

  return (
    <header className="border-b border-zinc-800 bg-black">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-sm font-black tracking-[0.35em] text-orange-500"
        >
          IRONBOUND
        </Link>

        {session?.user ? (
          <div className="flex items-center gap-3">
            {session.user.image && (
              <img
                src={session.user.image}
                alt=""
                className="h-10 w-10 rounded-full border border-zinc-700"
              />
            )}

            <div className="text-right">
              <p className="text-sm font-bold">
                {session.user.name}
              </p>

              <p className="text-xs text-zinc-500">
                PLAYER
              </p>
            </div>
          </div>
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