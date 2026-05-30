import { prisma } from "@/lib/db/prisma";

function percent(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

export async function recomputeAndPersistRoadmapProgress() {
  const [total, completed] = await Promise.all([
    prisma.roadmapTask.count(),
    prisma.roadmapTask.count({ where: { completed: true } }),
  ]);

  const nextIncomplete = await prisma.roadmapTask.findFirst({
    where: { completed: false },
    orderBy: [
      { section: { weekNumber: "asc" } },
      { dayNumber: "asc" },
      { order: "asc" },
      { createdAt: "asc" },
    ],
    include: { section: true },
  });

  const currentWeek = nextIncomplete?.section.weekNumber ?? 1;
  const currentDay = nextIncomplete?.dayNumber ?? 1;

  const updated = await prisma.roadmapProgress.upsert({
    where: { id: "roadmap" },
    create: {
      id: "roadmap",
      totalTasks: total,
      completedTasks: completed,
      completionPercentage: percent(completed, total),
      currentWeek,
      currentDay,
    },
    update: {
      totalTasks: total,
      completedTasks: completed,
      completionPercentage: percent(completed, total),
      currentWeek,
      currentDay,
    },
  });

  return updated;
}

export async function toggleRoadmapTaskCompletion(id: string, completed: boolean) {
  const updatedTask = await prisma.roadmapTask.update({
    where: { id },
    data: {
      completed,
      completedAt: completed ? new Date() : null,
    },
  });

  const progress = await recomputeAndPersistRoadmapProgress();

  return { task: updatedTask, progress };
}

export async function getRoadmapProgress() {
  const progress = await prisma.roadmapProgress.findUnique({ where: { id: "roadmap" } });
  return progress;
}
