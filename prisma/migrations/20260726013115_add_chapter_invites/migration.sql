-- CreateTable
CREATE TABLE "ChapterInvite" (
    "id" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "uses" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChapterInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChapterInvite_code_key" ON "ChapterInvite"("code");

-- CreateIndex
CREATE INDEX "ChapterInvite_communityId_idx" ON "ChapterInvite"("communityId");

-- AddForeignKey
ALTER TABLE "ChapterInvite" ADD CONSTRAINT "ChapterInvite_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;
