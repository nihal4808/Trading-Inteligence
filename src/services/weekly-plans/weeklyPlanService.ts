import { prisma } from "@/lib/db/prisma";

export async function listWeeklyPlans() {
  return prisma.weeklyPlan.findMany({
    orderBy: [{ weekStartDate: "desc" }, { createdAt: "desc" }],
  });
}

export async function createWeeklyPlan(input: {
  weekStartDate: string;
  weekEndDate: string;
  focusTopic: string;
  learningRoadmap?: string;
  movieRecommendations?: string;
  bookRecommendations?: string;
  weeklyGoals?: string;
}) {
  return prisma.weeklyPlan.create({
    data: {
      weekStartDate: new Date(input.weekStartDate),
      weekEndDate: new Date(input.weekEndDate),
      focusTopic: input.focusTopic,
      learningRoadmap: input.learningRoadmap,
      movieRecommendations: input.movieRecommendations,
      bookRecommendations: input.bookRecommendations,
      weeklyGoals: input.weeklyGoals,
      completionPercentage: 0,
    },
  });
}

export async function updateWeeklyPlan(
  id: string,
  patch: Partial<{
    weekStartDate: string;
    weekEndDate: string;
    focusTopic: string;
    learningRoadmap: string;
    movieRecommendations: string;
    bookRecommendations: string;
    weeklyGoals: string;
    progressNotes: string;
    completionPercentage: number;
  }>
) {
  return prisma.weeklyPlan.update({
    where: { id },
    data: {
      ...patch,
      weekStartDate: patch.weekStartDate ? new Date(patch.weekStartDate) : undefined,
      weekEndDate: patch.weekEndDate ? new Date(patch.weekEndDate) : undefined,
    },
  });
}

export async function deleteWeeklyPlan(id: string) {
  await prisma.weeklyPlan.delete({ where: { id } });
  return { ok: true };
}
