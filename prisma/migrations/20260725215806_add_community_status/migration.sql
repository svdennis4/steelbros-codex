-- CreateEnum
CREATE TYPE "CommunityStatus" AS ENUM ('DRAFT', 'ACTIVE', 'SUSPENDED');

-- AlterTable
ALTER TABLE "Community" ADD COLUMN     "status" "CommunityStatus" NOT NULL DEFAULT 'ACTIVE';
