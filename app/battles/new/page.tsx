import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/auth";
import BattleForm from "./BattleForm";

export default async function NewBattlePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/api/auth/signin?callbackUrl=/battles/new");
  }

  const currentUser = await prisma.user.findUnique({
  where: {
    id: session.user.id,
  },
  include: {
    communityMembers: {
      include: {
        community: {
          include: {
            gameSystem: true,
          },
        },
      },
    },
  },
});

if (!currentUser) {
  redirect("/");
}

const communityIds = currentUser.communityMembers.map(
  (membership) => membership.communityId
);

const opponents = await prisma.user.findMany({
  where: {
    id: {
      not: currentUser.id,
    },
    communityMembers: {
      some: {
        communityId: {
          in: communityIds,
        },
      },
    },
  },
  include: {
    communityMembers: {
      where: {
        communityId: {
          in: communityIds,
        },
      },
      include: {
        community: {
          include: {
            gameSystem: true,
          },
        },
      },
    },
  },
  orderBy: {
    displayName: "asc",
  },
});

const battleOpponents = opponents.map((opponent) => ({
  id: opponent.id,

  name:
    opponent.displayName ??
    opponent.discordUsername,

  sharedChapters: opponent.communityMembers.map((membership) => ({
    id: membership.community.id,
    name: membership.community.name,

    gameSystem: {
      id: membership.community.gameSystem.id,
      name: membership.community.gameSystem.name,
    },
  })),
}));

const factions = await prisma.faction.findMany({
  include: {
    gameSystem: true,
  },
  orderBy: {
    name: "asc",
  },
});

const battleFactions = factions.map((faction) => ({
  id: faction.id,
  name: faction.name,
  gameSystemId: faction.gameSystemId,
}));

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-8">
        <p className="text-xs font-black tracking-[0.25em] text-orange-500">
          RECORD BATTLE
        </p>

        <h1 className="mt-2 text-3xl font-black text-zinc-100">
          Submit a Battle
        </h1>

        <p className="mt-2 text-sm text-zinc-400">
          Record a completed battle and submit it to the Chapters you share
          with your opponent.
        </p>
      </div>

     <BattleForm opponents={battleOpponents}
                 factions={battleFactions}/>
</main>
  );
}