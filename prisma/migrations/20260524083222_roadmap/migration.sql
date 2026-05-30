/*
  Warnings:

  - You are about to drop the `MediaReview` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "MediaReview";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "MediaItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "category" TEXT,
    "mediaType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'unwatched',
    "rating" INTEGER,
    "review" TEXT,
    "lessonsLearned" TEXT,
    "emotionalImpact" TEXT,
    "watchedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RoadmapSection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "weekNumber" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RoadmapTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sectionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "estimatedDuration" INTEGER,
    "recommendedResources" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" DATETIME,
    "order" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RoadmapTask_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "RoadmapSection" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RoadmapProgress" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'roadmap',
    "totalTasks" INTEGER NOT NULL,
    "completedTasks" INTEGER NOT NULL,
    "completionPercentage" INTEGER NOT NULL,
    "currentWeek" INTEGER NOT NULL,
    "currentDay" INTEGER NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "MediaItem_status_idx" ON "MediaItem"("status");

-- CreateIndex
CREATE INDEX "MediaItem_mediaType_idx" ON "MediaItem"("mediaType");

-- CreateIndex
CREATE INDEX "MediaItem_category_idx" ON "MediaItem"("category");

-- CreateIndex
CREATE INDEX "MediaItem_title_idx" ON "MediaItem"("title");

-- CreateIndex
CREATE INDEX "RoadmapSection_order_idx" ON "RoadmapSection"("order");

-- CreateIndex
CREATE UNIQUE INDEX "RoadmapSection_weekNumber_key" ON "RoadmapSection"("weekNumber");

-- CreateIndex
CREATE INDEX "RoadmapTask_sectionId_idx" ON "RoadmapTask"("sectionId");

-- CreateIndex
CREATE INDEX "RoadmapTask_dayNumber_idx" ON "RoadmapTask"("dayNumber");

-- CreateIndex
CREATE INDEX "RoadmapTask_completed_idx" ON "RoadmapTask"("completed");

-- CreateIndex
CREATE INDEX "RoadmapTask_category_idx" ON "RoadmapTask"("category");

-- CreateIndex
CREATE INDEX "RoadmapTask_order_idx" ON "RoadmapTask"("order");
