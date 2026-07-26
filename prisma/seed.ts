import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  // Find the first Ironbound user.
  // Right now that's you because you're our only user.
  const user = await prisma.user.findFirst();

  if (!user) {
    throw new Error("No Ironbound user found. Sign in with Discord first.");
  }

  // Create Warhammer 40,000 game system if it doesn't already exist.
  const warhammer40k = await prisma.gameSystem.upsert({
    where: {
      slug: "warhammer-40k",
    },

    update: {
      name: "Warhammer 40,000",
    },

    create: {
      name: "Warhammer 40,000",
      slug: "warhammer-40k",
    },
  });

  // Create SteelBros if it doesn't already exist.
  const steelbros = await prisma.community.upsert({
    where: {
      slug: "steelbros",
    },

    update: {
      name: "SteelBros Gaming",
      gameSystemId: warhammer40k.id,
      description: "A Warhammer 40,000 community forging rivalries, campaigns, and local legends.",
    },

    create: {
      name: "SteelBros Gaming",
      slug: "steelbros",
      gameSystemId: warhammer40k.id,
      description: "A Warhammer 40,000 community forging rivalries, campaigns, and local legends.",
    },
  });

  // Connect your Ironbound account to SteelBros as OWNER.
  const membership = await prisma.communityMember.upsert({
    where: {
      userId_communityId: {
        userId: user.id,
        communityId: steelbros.id,
      },
    },

    update: {
      role: "OWNER",
    },

    create: {
      userId: user.id,
      communityId: steelbros.id,
      role: "OWNER",
    },
  });

  console.log("SteelBros Chapter created!");
  console.log("Game System:", warhammer40k.name);
  console.log("Chapter:", steelbros.name);
  console.log("Owner:", user.displayName ?? user.discordUsername);
  console.log("Role:", membership.role);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });