import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { prisma } from "@/lib/prisma";

export const authOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.AUTH_DISCORD_ID!,
      clientSecret: process.env.AUTH_DISCORD_SECRET!,
    }),
  ],

  callbacks: {
    async signIn({ account, profile }: any) {
      if (account?.provider !== "discord" || !profile) {
        return false;
      }

      const discordId = profile.id;
      const discordUsername = profile.username;

      await prisma.user.upsert({
        where: {
          discordId,
        },

        update: {
          discordUsername,
          displayName: profile.global_name ?? profile.username,
          avatarUrl: profile.avatar
            ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
            : null,
        },

        create: {
          discordId,
          discordUsername,
          displayName: profile.global_name ?? profile.username,
          avatarUrl: profile.avatar
            ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
            : null,
        },
      });

      return true;
    },
  },
};

export default NextAuth(authOptions);