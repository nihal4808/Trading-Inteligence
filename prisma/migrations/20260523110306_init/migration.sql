-- CreateTable
CREATE TABLE "WeeklyPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "DailyTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Trade" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "symbol" TEXT NOT NULL,
    "tradeType" TEXT NOT NULL,
    "entryPrice" REAL NOT NULL,
    "quantity" INTEGER NOT NULL,
    "exitPrice" REAL,
    "profitLoss" REAL,
    "winRate" INTEGER,
    "strategy" TEXT,
    "emotionalState" TEXT,
    "mistakes" TEXT,
    "lessons" TEXT,
    "tags" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "DiaryEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "content" TEXT,
    "mood" INTEGER NOT NULL DEFAULT 5,
    "confidence" INTEGER NOT NULL DEFAULT 5,
    "stress" INTEGER NOT NULL DEFAULT 5,
    "tradingPerformance" TEXT,
    "emotionalNotes" TEXT,
    "gratitude" TEXT,
    "goals" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "LearningLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "topic" TEXT NOT NULL,
    "lessonTitle" TEXT NOT NULL,
    "source" TEXT,
    "duration" INTEGER,
    "keyTakeaways" TEXT,
    "difficulty" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "proficiencyLevel" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MediaReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'unwatched',
    "rating" INTEGER,
    "reviewText" TEXT,
    "personalLessons" TEXT,
    "emotionalImpact" TEXT,
    "category" TEXT,
    "releaseDate" DATETIME,
    "duration" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "WeeklyPlan_weekStartDate_idx" ON "WeeklyPlan"("weekStartDate");

-- CreateIndex
CREATE INDEX "DailyTask_date_idx" ON "DailyTask"("date");

-- CreateIndex
CREATE INDEX "DailyTask_completed_idx" ON "DailyTask"("completed");

-- CreateIndex
CREATE INDEX "DailyTask_category_idx" ON "DailyTask"("category");

-- CreateIndex
CREATE INDEX "Trade_date_idx" ON "Trade"("date");

-- CreateIndex
CREATE INDEX "Trade_symbol_idx" ON "Trade"("symbol");

-- CreateIndex
CREATE INDEX "Trade_tradeType_idx" ON "Trade"("tradeType");

-- CreateIndex
CREATE INDEX "DiaryEntry_date_idx" ON "DiaryEntry"("date");

-- CreateIndex
CREATE INDEX "LearningLog_date_idx" ON "LearningLog"("date");

-- CreateIndex
CREATE INDEX "LearningLog_topic_idx" ON "LearningLog"("topic");

-- CreateIndex
CREATE INDEX "MediaReview_status_idx" ON "MediaReview"("status");

-- CreateIndex
CREATE INDEX "MediaReview_type_idx" ON "MediaReview"("type");
