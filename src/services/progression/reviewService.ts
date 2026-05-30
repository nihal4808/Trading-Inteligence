import { prisma } from "@/lib/db/prisma";
import type { RoadmapReview } from "@prisma/client";

/**
 * Review service for managing roadmap task reviews and reflections.
 * Tracks learning outcomes, emotional states, and progress insights.
 */

export interface CreateReviewInput {
  roadmapTaskId: string;
  review?: string;
  reflection?: string;
  mood?: number;
  confidenceLevel?: number;
  difficultyLevel?: number;
  lessonsLearned?: string;
}

export async function createOrUpdateReview(
  roadmapTaskId: string,
  input: CreateReviewInput
): Promise<RoadmapReview> {
  // Check if review already exists
  const existing = await prisma.roadmapReview.findFirst({
    where: { roadmapTaskId },
  });

  if (existing) {
    return prisma.roadmapReview.update({
      where: { id: existing.id },
      data: {
        review: input.review ?? existing.review,
        reflection: input.reflection ?? existing.reflection,
        mood: input.mood ?? existing.mood,
        confidenceLevel: input.confidenceLevel ?? existing.confidenceLevel,
        difficultyLevel: input.difficultyLevel ?? existing.difficultyLevel,
        lessonsLearned: input.lessonsLearned ?? existing.lessonsLearned,
      },
    });
  }

  return prisma.roadmapReview.create({
    data: {
      roadmapTaskId,
      review: input.review,
      reflection: input.reflection,
      mood: input.mood,
      confidenceLevel: input.confidenceLevel,
      difficultyLevel: input.difficultyLevel,
      lessonsLearned: input.lessonsLearned,
    },
  });
}

export async function getReviewForTask(taskId: string): Promise<RoadmapReview | null> {
  return prisma.roadmapReview.findFirst({
    where: { roadmapTaskId: taskId },
  });
}

export async function getReviewsForSection(sectionId: string): Promise<RoadmapReview[]> {
  const tasks = await prisma.roadmapTask.findMany({
    where: { sectionId },
    select: { id: true },
  });

  const taskIds = tasks.map((t) => t.id);

  return prisma.roadmapReview.findMany({
    where: { roadmapTaskId: { in: taskIds } },
    orderBy: { createdAt: "desc" },
  });
}

export async function markTaskAsReviewed(taskId: string): Promise<void> {
  // Check if review exists
  const review = await getReviewForTask(taskId);

  if (!review) {
    throw new Error("Cannot mark as reviewed: no review exists for this task");
  }

  // Update task status to reviewed
  await prisma.roadmapTask.update({
    where: { id: taskId },
    data: { status: "reviewed" },
  });
}

export async function getReviewStatistics(): Promise<{
  totalReviews: number;
  averageMood: number;
  averageConfidence: number;
  averageDifficulty: number;
  tasksWithReviews: number;
  tasksNeedingReview: number;
}> {
  const reviews = await prisma.roadmapReview.findMany();

  const completedTasks = await prisma.roadmapTask.findMany({
    where: { completed: true },
  });

  const reviewedTasks = completedTasks.filter((t) => t.status === "reviewed");

  const moods = reviews.map((r) => r.mood).filter((m) => m !== null) as number[];
  const confidences = reviews
    .map((r) => r.confidenceLevel)
    .filter((c) => c !== null) as number[];
  const difficulties = reviews
    .map((r) => r.difficultyLevel)
    .filter((d) => d !== null) as number[];

  return {
    totalReviews: reviews.length,
    averageMood: moods.length > 0 ? moods.reduce((a, b) => a + b) / moods.length : 0,
    averageConfidence:
      confidences.length > 0 ? confidences.reduce((a, b) => a + b) / confidences.length : 0,
    averageDifficulty:
      difficulties.length > 0 ? difficulties.reduce((a, b) => a + b) / difficulties.length : 0,
    tasksWithReviews: reviewedTasks.length,
    tasksNeedingReview: completedTasks.length - reviewedTasks.length,
  };
}

export async function getWeekProgressWithReviews(weekNumber: number): Promise<{
  weekNumber: number;
  title: string;
  totalTasks: number;
  completedTasks: number;
  reviewedTasks: number;
  averageConfidence: number | null;
  averageMood: number | null;
  averageDifficulty: number | null;
}> {
  const section = await prisma.roadmapSection.findUnique({
    where: { weekNumber },
    include: { tasks: true },
  });

  if (!section) {
    throw new Error(`Roadmap section not found for week ${weekNumber}`);
  }

  const reviews = await getReviewsForSection(section.id);

  const completedTasks = section.tasks.filter((t) => t.completed);
  const reviewedTasks = section.tasks.filter((t) => t.status === "reviewed");

  const moods = reviews.map((r) => r.mood).filter((m) => m !== null) as number[];
  const confidences = reviews
    .map((r) => r.confidenceLevel)
    .filter((c) => c !== null) as number[];
  const difficulties = reviews
    .map((r) => r.difficultyLevel)
    .filter((d) => d !== null) as number[];

  return {
    weekNumber: section.weekNumber,
    title: section.title,
    totalTasks: section.tasks.length,
    completedTasks: completedTasks.length,
    reviewedTasks: reviewedTasks.length,
    averageConfidence:
      confidences.length > 0
        ? Math.round(confidences.reduce((a, b) => a + b) / confidences.length)
        : null,
    averageMood: moods.length > 0 ? Math.round(moods.reduce((a, b) => a + b) / moods.length) : null,
    averageDifficulty:
      difficulties.length > 0
        ? Math.round(difficulties.reduce((a, b) => a + b) / difficulties.length)
        : null,
  };
}
