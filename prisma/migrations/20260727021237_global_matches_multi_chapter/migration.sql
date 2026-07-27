/*
  Warnings:

  - You are about to drop the column `communityId` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `seasonId` on the `Match` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[gameSystemId,name]` on the table `Faction` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[gameSystemId,slug]` on the table `Faction` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `gameSystemId` to the `Faction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gameSystemId` to the `Match` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_communityId_fkey";

-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_confirmedById_fkey";

-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_playerOneId_fkey";

-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_playerTwoId_fkey";

-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_seasonId_fkey";

-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_submittedById_fkey";

-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_winnerId_fkey";

-- DropIndex
DROP INDEX "Faction_name_key";

-- DropIndex
DROP INDEX "Faction_slug_key";

-- DropIndex
DROP INDEX "Match_communityId_playedAt_idx";

-- DropIndex
DROP INDEX "Match_seasonId_idx";

-- AlterTable
ALTER TABLE "Faction" ADD COLUMN     "gameSystemId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Match" DROP COLUMN "communityId",
DROP COLUMN "seasonId",
ADD COLUMN     "gameSystemId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "MatchCommunity" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "seasonId" TEXT,
    "playerOneEloBefore" INTEGER,
    "playerOneEloAfter" INTEGER,
    "playerTwoEloBefore" INTEGER,
    "playerTwoEloAfter" INTEGER,
    "playerOneFactionEloBefore" INTEGER,
    "playerOneFactionEloAfter" INTEGER,
    "playerTwoFactionEloBefore" INTEGER,
    "playerTwoFactionEloAfter" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MatchCommunity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MatchCommunity_communityId_idx" ON "MatchCommunity"("communityId");

-- CreateIndex
CREATE INDEX "MatchCommunity_seasonId_idx" ON "MatchCommunity"("seasonId");

-- CreateIndex
CREATE UNIQUE INDEX "MatchCommunity_matchId_communityId_key" ON "MatchCommunity"("matchId", "communityId");

-- CreateIndex
CREATE INDEX "Faction_gameSystemId_idx" ON "Faction"("gameSystemId");

-- CreateIndex
CREATE UNIQUE INDEX "Faction_gameSystemId_name_key" ON "Faction"("gameSystemId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Faction_gameSystemId_slug_key" ON "Faction"("gameSystemId", "slug");

-- CreateIndex
CREATE INDEX "Match_gameSystemId_playedAt_idx" ON "Match"("gameSystemId", "playedAt");

-- AddForeignKey
ALTER TABLE "Faction" ADD CONSTRAINT "Faction_gameSystemId_fkey" FOREIGN KEY ("gameSystemId") REFERENCES "GameSystem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_gameSystemId_fkey" FOREIGN KEY ("gameSystemId") REFERENCES "GameSystem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_playerOneId_fkey" FOREIGN KEY ("playerOneId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_playerTwoId_fkey" FOREIGN KEY ("playerTwoId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_confirmedById_fkey" FOREIGN KEY ("confirmedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchCommunity" ADD CONSTRAINT "MatchCommunity_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchCommunity" ADD CONSTRAINT "MatchCommunity_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchCommunity" ADD CONSTRAINT "MatchCommunity_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE SET NULL ON UPDATE CASCADE;
