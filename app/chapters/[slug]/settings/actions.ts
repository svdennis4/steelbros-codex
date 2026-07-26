"use server";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function updateChapter(
  slug: string,
  formData: FormData,
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("You must be signed in.");
  }

  const chapter = await prisma.community.findUnique({
    where: {
      slug,
    },
    include: {
      members: true,
    },
  });

  if (!chapter) {
    throw new Error("Chapter not found.");
  }

  const membership = chapter.members.find(
    (member) => member.userId === session.user.id,
  );

  if (!membership || membership.role !== "OWNER") {
    throw new Error("You do not have permission.");
  }

  const name = formData.get("name")?.toString();
  const description = formData.get("description")?.toString();
  const logoUrl = formData.get("logoUrl")?.toString();
  const bannerUrl = formData.get("bannerUrl")?.toString();

  await prisma.community.update({
    where: {
      id: chapter.id,
    },
    data: {
      name,
      description: description || null,
      logoUrl: logoUrl || null,
      bannerUrl: bannerUrl || null,
    },
  });

  redirect(`/chapters/${slug}`);
}