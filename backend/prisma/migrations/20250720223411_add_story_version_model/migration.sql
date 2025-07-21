-- CreateTable
CREATE TABLE "story_versions" (
    "id" UUID NOT NULL,
    "storyId" UUID NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "story_versions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "story_versions_storyId_versionNumber_key" ON "story_versions"("storyId", "versionNumber");

-- AddForeignKey
ALTER TABLE "story_versions" ADD CONSTRAINT "story_versions_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
