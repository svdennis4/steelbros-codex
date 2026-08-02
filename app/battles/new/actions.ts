"use server";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { calculateElo } from "@/lib/elo";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function submitBattle(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("You must be signed in to submit a battle.");
  }

  const submittedById = session.user.id;

  const opponentId = String(formData.get("opponentId") ?? "");
  const gameSystemId = String(formData.get("gameSystemId") ?? "");
  const playerOneFactionId = String(
    formData.get("playerFactionId") ?? ""
  );
  const playerTwoFactionId = String(
    formData.get("opponentFactionId") ?? ""
  );

  const communityIds = formData
    .getAll("communityIds")
    .map((value) => String(value));

  const playerOneScore = Number(formData.get("playerScore"));
  const playerTwoScore = Number(formData.get("opponentScore"));

  const playedAtValue = String(formData.get("playedAt") ?? "");
  const missionValue = String(formData.get("mission") ?? "").trim();
  const notesValue = String(formData.get("notes") ?? "").trim();

  if (!opponentId) {
    throw new Error("An opponent is required.");
  }

  if (opponentId === submittedById) {
    throw new Error("You cannot submit a battle against yourself.");
  }

  if (!gameSystemId) {
    throw new Error("A game system is required.");
  }

  if (!playerOneFactionId || !playerTwoFactionId) {
    throw new Error("Both factions are required.");
  }

  if (communityIds.length === 0) {
    throw new Error("Select at least one Chapter.");
  }

  if (
    !Number.isInteger(playerOneScore) ||
    playerOneScore < 0 ||
    !Number.isInteger(playerTwoScore) ||
    playerTwoScore < 0
  ) {
    throw new Error("Scores must be non-negative whole numbers.");
  }

  if (!playedAtValue) {
    throw new Error("Battle date is required.");
  }

  const playedAt = new Date(`${playedAtValue}T12:00:00`);

  if (Number.isNaN(playedAt.getTime())) {
    throw new Error("Invalid battle date.");
  }

  /*
   * Validate both factions belong to the selected game system.
   */
  const factions = await prisma.faction.findMany({
    where: {
      id: {
        in: [playerOneFactionId, playerTwoFactionId],
      },
    },
  });

  if (factions.length !== 2) {
    throw new Error("One or more selected factions are invalid.");
  }

  if (
    factions.some(
      (faction) => faction.gameSystemId !== gameSystemId
    )
  ) {
    throw new Error(
      "Selected factions do not belong to this game system."
    );
  }

  /*
   * Validate the selected Chapters.
   *
   * Each Chapter must:
   * - exist
   * - use this game system
   * - contain both players
   */
  const communities = await prisma.community.findMany({
    where: {
      id: {
        in: communityIds,
      },
    },
    include: {
      members: {
        where: {
          userId: {
            in: [submittedById, opponentId],
          },
        },
      },
      seasons: {
        where: {
          isActive: true,
        },
        orderBy: {
          startDate: "desc",
        },
        take: 1,
      },
    },
  });

  if (communities.length !== communityIds.length) {
    throw new Error("One or more selected Chapters are invalid.");
  }

  for (const community of communities) {
    if (community.gameSystemId !== gameSystemId) {
      throw new Error(
        "All selected Chapters must use the battle's game system."
      );
    }

    if (community.members.length !== 2) {
      throw new Error(
        "Both players must belong to every selected Chapter."
      );
    }
  }

  /*
   * Scores normally determine the winner.
   *
   * winnerId = null represents a draw.
   */
  let winnerId: string | null = null;

  if (playerOneScore > playerTwoScore) {
    winnerId = submittedById;
  } else if (playerTwoScore > playerOneScore) {
    winnerId = opponentId;
  }

  /*
   * Create one global battle plus one Chapter association
   * for every selected Chapter.
   */
const match = await prisma.$transaction(async (tx) => {
  const createdMatch = await tx.match.create({
    data: {
      gameSystemId,

      submittedById,
      playerOneId: submittedById,
      playerTwoId: opponentId,

      playerOneFactionId,
      playerTwoFactionId,

      playerOneScore,
      playerTwoScore,

      winnerId,

      playedAt,

      mission: missionValue || null,
      notes: notesValue || null,
    },
  });

  const result: "PLAYER_ONE" | "PLAYER_TWO" | "DRAW" =
    playerOneScore > playerTwoScore
      ? "PLAYER_ONE"
      : playerTwoScore > playerOneScore
        ? "PLAYER_TWO"
        : "DRAW";

  for (const community of communities) {
    const playerOneMember = community.members.find(
      (member) => member.userId === submittedById
    );

    const playerTwoMember = community.members.find(
      (member) => member.userId === opponentId
    );

    if (!playerOneMember || !playerTwoMember) {
      throw new Error(
        "Both players must belong to every selected Chapter."
      );
    }

    /*
     * Overall Chapter Elo
     */
    const overallElo = calculateElo(
      playerOneMember.lifetimeElo,
      playerTwoMember.lifetimeElo,
      result
    );

    /*
     * Find or create each player's faction record
     * within this specific Chapter.
     */
    const playerOneFaction = await tx.playerFaction.upsert({
      where: {
        communityMemberId_factionId: {
          communityMemberId: playerOneMember.id,
          factionId: playerOneFactionId,
        },
      },
      update: {},
      create: {
        communityMemberId: playerOneMember.id,
        factionId: playerOneFactionId,
      },
    });

    const playerTwoFaction = await tx.playerFaction.upsert({
      where: {
        communityMemberId_factionId: {
          communityMemberId: playerTwoMember.id,
          factionId: playerTwoFactionId,
        },
      },
      update: {},
      create: {
        communityMemberId: playerTwoMember.id,
        factionId: playerTwoFactionId,
      },
    });

    /*
     * Faction-specific Elo
     */
    const factionElo = calculateElo(
      playerOneFaction.lifetimeElo,
      playerTwoFaction.lifetimeElo,
      result
    );

    /*
     * Update overall Chapter records
     */
    await tx.communityMember.update({
      where: {
        id: playerOneMember.id,
      },
      data: {
        lifetimeElo: overallElo.playerOneAfter,

        lifetimeWins:
          result === "PLAYER_ONE"
            ? { increment: 1 }
            : undefined,

        lifetimeLosses:
          result === "PLAYER_TWO"
            ? { increment: 1 }
            : undefined,

        lifetimeDraws:
          result === "DRAW"
            ? { increment: 1 }
            : undefined,
      },
    });

    await tx.communityMember.update({
      where: {
        id: playerTwoMember.id,
      },
      data: {
        lifetimeElo: overallElo.playerTwoAfter,

        lifetimeWins:
          result === "PLAYER_TWO"
            ? { increment: 1 }
            : undefined,

        lifetimeLosses:
          result === "PLAYER_ONE"
            ? { increment: 1 }
            : undefined,

        lifetimeDraws:
          result === "DRAW"
            ? { increment: 1 }
            : undefined,
      },
    });

    /*
     * Update faction records
     */
    await tx.playerFaction.update({
      where: {
        id: playerOneFaction.id,
      },
      data: {
        lifetimeElo: factionElo.playerOneAfter,

        lifetimeWins:
          result === "PLAYER_ONE"
            ? { increment: 1 }
            : undefined,

        lifetimeLosses:
          result === "PLAYER_TWO"
            ? { increment: 1 }
            : undefined,

        lifetimeDraws:
          result === "DRAW"
            ? { increment: 1 }
            : undefined,
      },
    });

    await tx.playerFaction.update({
      where: {
        id: playerTwoFaction.id,
      },
      data: {
        lifetimeElo: factionElo.playerTwoAfter,

        lifetimeWins:
          result === "PLAYER_TWO"
            ? { increment: 1 }
            : undefined,

        lifetimeLosses:
          result === "PLAYER_ONE"
            ? { increment: 1 }
            : undefined,

        lifetimeDraws:
          result === "DRAW"
            ? { increment: 1 }
            : undefined,
      },
    });

    /*
     * Record the Chapter-specific battle + Elo history.
     */
    await tx.matchCommunity.create({
      data: {
        matchId: createdMatch.id,
        communityId: community.id,
        seasonId: community.seasons[0]?.id ?? null,

        status: "ACTIVE",

        playerOneEloBefore: overallElo.playerOneBefore,
        playerOneEloAfter: overallElo.playerOneAfter,

        playerTwoEloBefore: overallElo.playerTwoBefore,
        playerTwoEloAfter: overallElo.playerTwoAfter,

        playerOneFactionEloBefore:
          factionElo.playerOneBefore,
        playerOneFactionEloAfter:
          factionElo.playerOneAfter,

        playerTwoFactionEloBefore:
          factionElo.playerTwoBefore,
        playerTwoFactionEloAfter:
          factionElo.playerTwoAfter,
      },
    });
  }

  return createdMatch;
});

  redirect(`/battles/${match.id}`);
}