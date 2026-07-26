"use server";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function joinChapter(code: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("You must be signed in to join a Chapter.");
  }

  const invite = await prisma.chapterInvite.findUnique({
    where: {
      code,
    },
    include: {
      community: true,
    },
  });

  if (!invite || !invite.active) {
    throw new Error("This invite is invalid or inactive.");
  }

  const existingMember =
    await prisma.communityMember.findUnique({
      where: {
        userId_communityId: {
          userId: session.user.id,
          communityId: invite.communityId,
        },
      },
    });

  if (!existingMember) {
    await prisma.communityMember.create({
      data: {
        userId: session.user.id,
        communityId: invite.communityId,
        role: "MEMBER",
      },
    });
  }

  redirect(`/chapters/${invite.community.slug}`);
}