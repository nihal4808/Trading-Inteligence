-- CreateTable
CREATE TABLE "RoadmapReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "roadmapTaskId" TEXT NOT NULL,
    "review" TEXT,
    "reflection" TEXT,
    "mood" INTEGER,
    "confidenceLevel" INTEGER,
    "difficultyLevel" INTEGER,
    "lessonsLearned" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RoadmapReview_roadmapTaskId_fkey" FOREIGN KEY ("roadmapTaskId") REFERENCES "RoadmapTask" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DailyTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "roadmapTaskId" TEXT,
    "date" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" DATETIME,
    "timeSpent" INTEGER,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DailyTask_roadmapTaskId_fkey" FOREIGN KEY ("roadmapTaskId") REFERENCES "RoadmapTask" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_DailyTask" ("category", "completed", "completedAt", "createdAt", "date", "description", "id", "notes", "priority", "timeSpent", "title", "updatedAt") SELECT "category", "completed", "completedAt", "createdAt", "date", "description", "id", "notes", "priority", "timeSpent", "title", "updatedAt" FROM "DailyTask";
DROP TABLE "DailyTask";
ALTER TABLE "new_DailyTask" RENAME TO "DailyTask";
CREATE INDEX "DailyTask_date_idx" ON "DailyTask"("date");
CREATE INDEX "DailyTask_completed_idx" ON "DailyTask"("completed");
CREATE INDEX "DailyTask_category_idx" ON "DailyTask"("category");
CREATE INDEX "DailyTask_roadmapTaskId_idx" ON "DailyTask"("roadmapTaskId");
CREATE TABLE "new_RoadmapTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sectionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "dayLabel" TEXT,
    "estimatedDuration" INTEGER,
    "recommendedResources" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "progressPercentage" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "order" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RoadmapTask_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "RoadmapSection" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_RoadmapTask" ("category", "completed", "completedAt", "createdAt", "dayLabel", "dayNumber", "description", "estimatedDuration", "id", "order", "recommendedResources", "sectionId", "title", "updatedAt") SELECT "category", "completed", "completedAt", "createdAt", "dayLabel", "dayNumber", "description", "estimatedDuration", "id", "order", "recommendedResources", "sectionId", "title", "updatedAt" FROM "RoadmapTask";
DROP TABLE "RoadmapTask";
ALTER TABLE "new_RoadmapTask" RENAME TO "RoadmapTask";
CREATE INDEX "RoadmapTask_sectionId_idx" ON "RoadmapTask"("sectionId");
CREATE INDEX "RoadmapTask_dayNumber_idx" ON "RoadmapTask"("dayNumber");
CREATE INDEX "RoadmapTask_completed_idx" ON "RoadmapTask"("completed");
CREATE INDEX "RoadmapTask_status_idx" ON "RoadmapTask"("status");
CREATE INDEX "RoadmapTask_category_idx" ON "RoadmapTask"("category");
CREATE INDEX "RoadmapTask_order_idx" ON "RoadmapTask"("order");
CREATE TABLE "new_WeeklyPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "roadmapSectionId" TEXT,
    "weekStartDate" DATETIME NOT NULL,
    "weekEndDate" DATETIME NOT NULL,
    "focusTopic" TEXT NOT NULL,
    "learningRoadmap" TEXT,
    "movieRecommendations" TEXT,
    "bookRecommendations" TEXT,
    "weeklyGoals" TEXT,
    "progressNotes" TEXT,
    "completionPercentage" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WeeklyPlan_roadmapSectionId_fkey" FOREIGN KEY ("roadmapSectionId") REFERENCES "RoadmapSection" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_WeeklyPlan" ("bookRecommendations", "completionPercentage", "createdAt", "focusTopic", "id", "learningRoadmap", "movieRecommendations", "progressNotes", "updatedAt", "weekEndDate", "weekStartDate", "weeklyGoals") SELECT "bookRecommendations", "completionPercentage", "createdAt", "focusTopic", "id", "learningRoadmap", "movieRecommendations", "progressNotes", "updatedAt", "weekEndDate", "weekStartDate", "weeklyGoals" FROM "WeeklyPlan";
DROP TABLE "WeeklyPlan";
ALTER TABLE "new_WeeklyPlan" RENAME TO "WeeklyPlan";
CREATE UNIQUE INDEX "WeeklyPlan_roadmapSectionId_key" ON "WeeklyPlan"("roadmapSectionId");
CREATE INDEX "WeeklyPlan_weekStartDate_idx" ON "WeeklyPlan"("weekStartDate");
CREATE INDEX "WeeklyPlan_roadmapSectionId_idx" ON "WeeklyPlan"("roadmapSectionId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "RoadmapReview_roadmapTaskId_idx" ON "RoadmapReview"("roadmapTaskId");

-- CreateIndex
CREATE INDEX "RoadmapReview_createdAt_idx" ON "RoadmapReview"("createdAt");
