/*
  Warnings:

  - You are about to drop the column `expiresAt` on the `ChapterInvite` table. All the data in the column will be lost.
  - You are about to drop the column `uses` on the `ChapterInvite` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[communityId]` on the table `ChapterInvite` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `ChapterInvite` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "ChapterInvite_communityId_idx";

-- AlterTable
ALTER TABLE "ChapterInvite" DROP COLUMN "expiresAt",
DROP COLUMN "uses",
ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "ChapterInvite_code_idx" ON "ChapterInvite"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ChapterInvite_communityId_key" ON "ChapterInvite"("communityId");
