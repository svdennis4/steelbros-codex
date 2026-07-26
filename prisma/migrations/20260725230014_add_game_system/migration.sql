-- AlterTable
ALTER TABLE "Community" ADD COLUMN     "gameSystemId" TEXT;

-- CreateTable
CREATE TABLE "GameSystem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameSystem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GameSystem_name_key" ON "GameSystem"("name");

-- CreateIndex
CREATE UNIQUE INDEX "GameSystem_slug_key" ON "GameSystem"("slug");

-- AddForeignKey
ALTER TABLE "Community" ADD CONSTRAINT "Community_gameSystemId_fkey" FOREIGN KEY ("gameSystemId") REFERENCES "GameSystem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
