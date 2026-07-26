"use server";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

function createSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function createChapter(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("You must be signed in to create a Chapter.");
  }

  const name = formData.get("name")?.toString();
  const gameSystemId = formData.get("gameSystemId")?.toString();
  const description = formData.get("description")?.toString();

  if (!name) {
    throw new Error("Chapter name is required.");
  }

  if (!gameSystemId) {
    throw new Error("Game system is required.");
  }

  const gameSystem = await prisma.gameSystem.findUnique({
    where: {
      id: gameSystemId,
    },
  });

  if (!gameSystem) {
    throw new Error("Invalid game system.");
  }

  const slug = createSlug(name);

  const existingChapter = await prisma.community.findUnique({
    where: {
      slug,
    },
  });

  if (existingChapter) {
    throw new Error("A Chapter with this name already exists.");
  }

  const chapter = await prisma.community.create({
    data: {
      name,
      slug,
      description: description || null,
      gameSystemId,
    },
  });

  await prisma.communityMember.create({
    data: {
      userId: session.user.id,
      communityId: chapter.id,
      role: "OWNER",
    },
  });

  redirect(`/chapters/${chapter.slug}`);
}