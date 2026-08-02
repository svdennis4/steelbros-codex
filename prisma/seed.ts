import "dotenv/config";

import { prisma } from "../lib/prisma";

const warhammer40kFactions = [
  { name: "Adepta Sororitas", slug: "adepta-sororitas" },
  { name: "Adeptus Custodes", slug: "adeptus-custodes" },
  { name: "Adeptus Mechanicus", slug: "adeptus-mechanicus" },
  { name: "Aeldari", slug: "aeldari" },
  { name: "Astra Militarum", slug: "astra-militarum" },
  { name: "Black Templars", slug: "black-templars" },
  { name: "Blood Angels", slug: "blood-angels" },
  { name: "Chaos Daemons", slug: "chaos-daemons" },
  { name: "Chaos Knights", slug: "chaos-knights" },
  { name: "Chaos Space Marines", slug: "chaos-space-marines" },
  { name: "Dark Angels", slug: "dark-angels" },
  { name: "Death Guard", slug: "death-guard" },
  { name: "Deathwatch", slug: "deathwatch" },
  { name: "Drukhari", slug: "drukhari" },
  { name: "Emperor's Children", slug: "emperors-children" },
  { name: "Genestealer Cults", slug: "genestealer-cults" },
  { name: "Grey Knights", slug: "grey-knights" },
  { name: "Imperial Agents", slug: "imperial-agents" },
  { name: "Imperial Knights", slug: "imperial-knights" },
  { name: "Leagues of Votann", slug: "leagues-of-votann" },
  { name: "Necrons", slug: "necrons" },
  { name: "Orks", slug: "orks" },
  { name: "Space Marines", slug: "space-marines" },
  { name: "Space Wolves", slug: "space-wolves" },
  { name: "T'au Empire", slug: "tau-empire" },
  { name: "Thousand Sons", slug: "thousand-sons" },
  { name: "Tyranids", slug: "tyranids" },
  { name: "World Eaters", slug: "world-eaters" },
];

async function main() {
  /*
   * The user must sign in with Discord at least once before running
   * this seed because the seed assigns the first Ironbound user
   * as the owner of SteelBros.
   */
  const user = await prisma.user.findFirst({
    orderBy: {
      createdAt: "asc",
    },
  });

  if (!user) {
    throw new Error(
      "No Ironbound user found. Sign in with Discord before running the seed."
    );
  }

  /*
   * Create the supported game systems.
   *
   * Only Warhammer 40,000 has faction data for now.
   * We can add AoS and Bolt Action factions later.
   */
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

  await prisma.gameSystem.upsert({
    where: {
      slug: "age-of-sigmar",
    },
    update: {
      name: "Warhammer Age of Sigmar",
    },
    create: {
      name: "Warhammer Age of Sigmar",
      slug: "age-of-sigmar",
    },
  });

  await prisma.gameSystem.upsert({
    where: {
      slug: "bolt-action",
    },
    update: {
      name: "Bolt Action",
    },
    create: {
      name: "Bolt Action",
      slug: "bolt-action",
    },
  });

  /*
   * Create or update every Warhammer 40,000 faction.
   *
   * The compound unique key means the same slug could theoretically
   * exist under another game system without causing a conflict.
   */
  for (const faction of warhammer40kFactions) {
    await prisma.faction.upsert({
      where: {
        gameSystemId_slug: {
          gameSystemId: warhammer40k.id,
          slug: faction.slug,
        },
      },
      update: {
        name: faction.name,
      },
      create: {
        name: faction.name,
        slug: faction.slug,
        gameSystemId: warhammer40k.id,
      },
    });
  }

  /*
   * Create or update the SteelBros Chapter.
   */
  const steelbros = await prisma.community.upsert({
    where: {
      slug: "steelbros",
    },
    update: {
      name: "SteelBros Gaming",
      gameSystemId: warhammer40k.id,
      status: "ACTIVE",
    },
    create: {
      name: "SteelBros Gaming",
      slug: "steelbros",
      description:
        "A Warhammer 40,000 community forged through battle, rivalry, and legacy.",
      status: "ACTIVE",
      gameSystemId: warhammer40k.id,
    },
  });

  /*
   * Connect the first Ironbound user to SteelBros as its owner.
   */
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

  console.log("Ironbound seed completed.");
  console.log(`Game system: ${warhammer40k.name}`);
  console.log(`40K factions: ${warhammer40kFactions.length}`);
  console.log(`Chapter: ${steelbros.name}`);
  console.log(
    `Owner: ${user.displayName ?? user.discordUsername} (${membership.role})`
  );
}

main()
  .catch((error) => {
    console.error("Seed failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });