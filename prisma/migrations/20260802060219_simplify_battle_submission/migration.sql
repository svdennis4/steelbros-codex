/*
  Warnings:

  - You are about to drop the column `confirmedAt` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `confirmedById` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `disputeReason` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Match` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "MatchCommunityStatus" AS ENUM ('ACTIVE', 'VOIDED');

-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_confirmedById_fkey";

-- DropIndex
DROP INDEX "Match_status_idx";

-- AlterTable
ALTER TABLE "Match" DROP COLUMN "confirmedAt",
DROP COLUMN "confirmedById",
DROP COLUMN "disputeReason",
DROP COLUMN "status",
ADD COLUMN     "playerOneScore" INTEGER,
ADD COLUMN     "playerTwoScore" INTEGER;

-- AlterTable
ALTER TABLE "MatchCommunity" ADD COLUMN     "status" "MatchCommunityStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "voidReason" TEXT,
ADD COLUMN     "voidedAt" TIMESTAMP(3),
ADD COLUMN     "voidedById" TEXT;

-- DropEnum
DROP TYPE "MatchStatus";

-- CreateIndex
CREATE INDEX "Match_submittedById_idx" ON "Match"("submittedById");

-- CreateIndex
CREATE INDEX "Match_winnerId_idx" ON "Match"("winnerId");

-- CreateIndex
CREATE INDEX "MatchCommunity_status_idx" ON "MatchCommunity"("status");

-- CreateIndex
CREATE INDEX "MatchCommunity_voidedById_idx" ON "MatchCommunity"("voidedById");

-- AddForeignKey
ALTER TABLE "MatchCommunity" ADD CONSTRAINT "MatchCommunity_voidedById_fkey" FOREIGN KEY ("voidedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
