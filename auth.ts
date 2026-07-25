import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { prisma } from "@/lib/prisma";

export const authOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.AUTH_DISCORD_ID!,
      clientSecret: process.env.AUTH_DISCORD_SECRET!,
      authorization: {
        params: {
          scope: "identify",
        },
      },
    }),
  ],

  session: {
    strategy: "jwt" as const,
  },

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

    async jwt({ token, account, profile }: any) {
      // account and profile are available during the initial Discord sign-in.
      if (account?.provider === "discord" && profile) {
        const discordId = profile.id;

        const ironboundUser = await prisma.user.findUnique({
          where: {
            discordId,
          },
        });

        if (ironboundUser) {
          token.userId = ironboundUser.id;
          token.discordId = ironboundUser.discordId;
        }
      }

      return token;
    },

async session({ session, token }: any) {
  if (session.user) {
    session.user.id = token.userId;
    session.user.discordId = token.discordId;
    session.user.email = null;
  }

  return session;
},
  },
};

export default NextAuth(authOptions);