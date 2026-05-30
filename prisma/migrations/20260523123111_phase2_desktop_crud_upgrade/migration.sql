-- AlterTable
ALTER TABLE "DiaryEntry" ADD COLUMN "tags" TEXT;
ALTER TABLE "DiaryEntry" ADD COLUMN "title" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MediaReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "category" TEXT,
    "type" TEXT NOT NULL,
    "watchStatus" TEXT NOT NULL DEFAULT 'unwatched',
    "status" TEXT NOT NULL DEFAULT 'unwatched',
    "rating" INTEGER,
    "review" TEXT,
    "reviewText" TEXT,
    "lessonsLearned" TEXT,
    "personalLessons" TEXT,
    "emotionalImpact" TEXT,
    "dateWatched" DATETIME,
    "releaseDate" DATETIME,
    "duration" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_MediaReview" ("category", "createdAt", "duration", "emotionalImpact", "id", "personalLessons", "rating", "releaseDate", "reviewText", "status", "title", "type", "updatedAt") SELECT "category", "createdAt", "duration", "emotionalImpact", "id", "personalLessons", "rating", "releaseDate", "reviewText", "status", "title", "type", "updatedAt" FROM "MediaReview";
DROP TABLE "MediaReview";
ALTER TABLE "new_MediaReview" RENAME TO "MediaReview";
CREATE INDEX "MediaReview_status_idx" ON "MediaReview"("status");
CREATE INDEX "MediaReview_watchStatus_idx" ON "MediaReview"("watchStatus");
CREATE INDEX "MediaReview_type_idx" ON "MediaReview"("type");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "DiaryEntry_title_idx" ON "DiaryEntry"("title");
