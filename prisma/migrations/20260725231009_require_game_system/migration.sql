/*
  Warnings:

  - Made the column `gameSystemId` on table `Community` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Community" DROP CONSTRAINT "Community_gameSystemId_fkey";

-- AlterTable
ALTER TABLE "Community" ALTER COLUMN "gameSystemId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Community" ADD CONSTRAINT "Community_gameSystemId_fkey" FOREIGN KEY ("gameSystemId") REFERENCES "GameSystem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
