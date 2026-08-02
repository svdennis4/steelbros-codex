import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

type BattlePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function BattlePage({
  params,
}: BattlePageProps) {
  const { id } = await params;

  const battle = await prisma.match.findUnique({
    where: {
      id,
    },
    include: {
      gameSystem: true,
      submittedBy: true,
      playerOne: true,
      playerTwo: true,
      winner: true,
      playerOneFaction: true,
      playerTwoFaction: true,
      communities: {
        include: {
          community: true,
          season: true,
        },
      },
    },
  });

  if (!battle) {
    notFound();
  }

  const playerOneName =
    battle.playerOne.displayName ??
    battle.playerOne.discordUsername;

  const playerTwoName =
    battle.playerTwo.displayName ??
    battle.playerTwo.discordUsername;

  const isDraw = battle.winnerId === null;

  function formatEloChange(before: number | null, after: number | null) {
    if (before === null || after === null) {
        return null;
    }

    const change = after - before;

    if (change > 0) {
        return `+${change}`;
    }

    return `${change}`;
}

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8">
        <p className="text-xs font-black tracking-[0.25em] text-orange-500">
          BATTLE RECORD
        </p>

        <h1 className="mt-2 text-3xl font-black text-zinc-100">
          {playerOneName} vs {playerTwoName}
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          {battle.gameSystem.name}
        </p>
      </div>

      <div className="border border-zinc-800 bg-zinc-950">
        <div className="grid md:grid-cols-2">
          <div className="border-b border-zinc-800 p-6 md:border-b-0 md:border-r">
            <p className="text-xs font-black tracking-wider text-zinc-500">
              PLAYER ONE
            </p>

            <h2 className="mt-2 text-xl font-black text-zinc-100">
              {playerOneName}
            </h2>

            <p className="mt-1 text-sm text-orange-500">
              {battle.playerOneFaction.name}
            </p>

            <p className="mt-6 text-5xl font-black text-zinc-100">
              {battle.playerOneScore ?? "—"}
            </p>
          </div>

          <div className="p-6">
            <p className="text-xs font-black tracking-wider text-zinc-500">
              PLAYER TWO
            </p>

            <h2 className="mt-2 text-xl font-black text-zinc-100">
              {playerTwoName}
            </h2>

            <p className="mt-1 text-sm text-orange-500">
              {battle.playerTwoFaction.name}
            </p>

            <p className="mt-6 text-5xl font-black text-zinc-100">
              {battle.playerTwoScore ?? "—"}
            </p>
          </div>
        </div>

        <div className="border-t border-zinc-800 p-6">
          <p className="text-xs font-black tracking-wider text-zinc-500">
            RESULT
          </p>

          <p className="mt-2 text-lg font-black text-zinc-100">
            {isDraw
              ? "Draw"
              : `${battle.winner?.displayName ??
                  battle.winner?.discordUsername} wins`}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="border border-zinc-800 bg-zinc-950 p-6">
          <p className="text-xs font-black tracking-wider text-zinc-500">
            BATTLE DETAILS
          </p>

          <div className="mt-4 space-y-4 text-sm">
            <div>
              <p className="text-zinc-500">Date Played</p>
              <p className="mt-1 font-bold text-zinc-200">
                {battle.playedAt.toLocaleDateString()}
              </p>
            </div>

            {battle.mission && (
              <div>
                <p className="text-zinc-500">Mission</p>
                <p className="mt-1 font-bold text-zinc-200">
                  {battle.mission}
                </p>
              </div>
            )}

            <div>
              <p className="text-zinc-500">Submitted By</p>
              <p className="mt-1 font-bold text-zinc-200">
                {battle.submittedBy.displayName ??
                  battle.submittedBy.discordUsername}
              </p>
            </div>
          </div>
        </div>

        <div className="border border-zinc-800 bg-zinc-950 p-6">
  <p className="text-xs font-black tracking-wider text-zinc-500">
    RECORDED IN
  </p>

  <div className="mt-4 space-y-4">
    {battle.communities.map((entry) => {
      const playerOneEloChange = formatEloChange(
        entry.playerOneEloBefore,
        entry.playerOneEloAfter
      );

      const playerTwoEloChange = formatEloChange(
        entry.playerTwoEloBefore,
        entry.playerTwoEloAfter
      );

      const playerOneFactionEloChange = formatEloChange(
        entry.playerOneFactionEloBefore,
        entry.playerOneFactionEloAfter
      );

      const playerTwoFactionEloChange = formatEloChange(
        entry.playerTwoFactionEloBefore,
        entry.playerTwoFactionEloAfter
      );

      return (
        <div
          key={entry.id}
          className="border border-zinc-800 bg-black p-4"
        >
          <div>
            <Link
              href={`/chapters/${entry.community.slug}`}
              className="font-black text-zinc-100 hover:text-orange-500"
            >
              {entry.community.name}
            </Link>

            {entry.season && (
              <p className="mt-1 text-xs text-zinc-500">
                {entry.season.name}
              </p>
            )}

            {entry.status === "VOIDED" && (
              <p className="mt-2 text-xs font-black tracking-wider text-red-500">
                VOIDED
              </p>
            )}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4 border-t border-zinc-800 pt-4">
            {/* Player One */}
            <div>
              <p className="text-xs font-black text-zinc-400">
                {playerOneName}
              </p>

              {entry.playerOneEloAfter !== null && (
                <div className="mt-2">
                  <p className="text-lg font-black text-zinc-100">
                    {entry.playerOneEloAfter} ELO
                  </p>

                  <p
                    className={`text-xs font-bold ${
                      (playerOneEloChange ?? "").startsWith("+")
                        ? "text-green-500"
                        : playerOneEloChange === "0"
                          ? "text-zinc-500"
                          : "text-red-500"
                    }`}
                  >
                    {playerOneEloChange}
                  </p>
                </div>
              )}

              {entry.playerOneFactionEloAfter !== null && (
                <div className="mt-4">
                  <p className="text-xs text-zinc-500">
                    {battle.playerOneFaction.name}
                  </p>

                  <p className="mt-1 text-sm font-bold text-zinc-300">
                    {entry.playerOneFactionEloAfter} Faction Elo
                  </p>

                  <p
                    className={`text-xs font-bold ${
                      (playerOneFactionEloChange ?? "").startsWith("+")
                        ? "text-green-500"
                        : playerOneFactionEloChange === "0"
                          ? "text-zinc-500"
                          : "text-red-500"
                    }`}
                  >
                    {playerOneFactionEloChange}
                  </p>
                </div>
              )}
            </div>

            {/* Player Two */}
            <div>
              <p className="text-xs font-black text-zinc-400">
                {playerTwoName}
              </p>

              {entry.playerTwoEloAfter !== null && (
                <div className="mt-2">
                  <p className="text-lg font-black text-zinc-100">
                    {entry.playerTwoEloAfter} ELO
                  </p>

                  <p
                    className={`text-xs font-bold ${
                      (playerTwoEloChange ?? "").startsWith("+")
                        ? "text-green-500"
                        : playerTwoEloChange === "0"
                          ? "text-zinc-500"
                          : "text-red-500"
                    }`}
                  >
                    {playerTwoEloChange}
                  </p>
                </div>
              )}

              {entry.playerTwoFactionEloAfter !== null && (
                <div className="mt-4">
                  <p className="text-xs text-zinc-500">
                    {battle.playerTwoFaction.name}
                  </p>

                  <p className="mt-1 text-sm font-bold text-zinc-300">
                    {entry.playerTwoFactionEloAfter} Faction Elo
                  </p>

                  <p
                    className={`text-xs font-bold ${
                      (playerTwoFactionEloChange ?? "").startsWith("+")
                        ? "text-green-500"
                        : playerTwoFactionEloChange === "0"
                          ? "text-zinc-500"
                          : "text-red-500"
                    }`}
                  >
                    {playerTwoFactionEloChange}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    })}
  </div>
</div>
      </div>

      {battle.notes && (
        <div className="mt-6 border border-zinc-800 bg-zinc-950 p-6">
          <p className="text-xs font-black tracking-wider text-zinc-500">
            BATTLE NOTES
          </p>

          <p className="mt-4 whitespace-pre-wrap text-sm text-zinc-300">
            {battle.notes}
          </p>
        </div>
      )}
    </main>
  );
}