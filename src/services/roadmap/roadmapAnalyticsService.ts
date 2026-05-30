import { prisma } from "@/lib/db/prisma";

function percent(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

export async function getRoadmapAnalytics() {
  const [tasks, sections] = await Promise.all([
    prisma.roadmapTask.findMany({
      include: { section: true },
      orderBy: [
        { section: { weekNumber: "asc" } },
        { dayNumber: "asc" },
        { order: "asc" },
      ],
    }),
    prisma.roadmapSection.findMany({ orderBy: [{ weekNumber: "asc" }] }),
  ]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const completionPercentage = percent(completedTasks, totalTasks);

  const completedWeeks = new Set<number>();
  for (const section of sections) {
    const weekTasks = tasks.filter((t) => t.sectionId === section.id);
    if (weekTasks.length > 0 && weekTasks.every((t) => t.completed)) {
      completedWeeks.add(section.weekNumber);
    }
  }

  const nextIncomplete = tasks.find((t) => !t.completed);
  const currentWeek = nextIncomplete?.section.weekNumber ?? (sections[0]?.weekNumber ?? 1);
  const currentDay = nextIncomplete?.dayNumber ?? 1;
  const activeSectionTitle = nextIncomplete?.section.title ?? (sections[0]?.title ?? "Roadmap");

  const remainingMinutes = tasks
    .filter((t) => !t.completed)
    .reduce((sum, t) => sum + (t.estimatedDuration ?? 0), 0);

  // Consistency proxy: how many tasks completed in the last 7 days.
  const since = new Date();
  since.setDate(since.getDate() - 7);
  const recentlyCompleted = await prisma.roadmapTask.count({
    where: { completedAt: { gte: since } },
  });

  const estimatedDaysRemaining = Math.ceil(
    tasks.filter((t) => !t.completed).length / 3
  ); // heuristic: ~3 tasks/day

  return {
    totalTasks,
    completedTasks,
    completionPercentage,
    completedWeeks: completedWeeks.size,
    totalWeeks: sections.length,
    currentWeek,
    currentDay,
    activeFocus: activeSectionTitle,
    remainingMinutes,
    recentlyCompleted,
    estimatedDaysRemaining,
  };
}

type CurrentDayTask = {
  id: string;
  title: string;
  category: string;
  completed: boolean;
  dayNumber: number;
  estimatedDuration: number | null;
};

type CurrentDayTasksResult = {
  currentWeek: number;
  currentDay: number;
  sectionTitle: string | null;
  tasks: CurrentDayTask[];
};

export async function getCurrentDayTasks(): Promise<CurrentDayTasksResult> {
  const nextIncomplete = await prisma.roadmapTask.findFirst({
    where: { completed: false },
    orderBy: [
      { section: { weekNumber: "asc" } },
      { dayNumber: "asc" },
      { order: "asc" },
    ],
    include: { section: true },
  });

  if (!nextIncomplete) {
    return { currentWeek: 1, currentDay: 1, sectionTitle: null, tasks: [] };
  }

  const tasks = await prisma.roadmapTask.findMany({
    where: {
      sectionId: nextIncomplete.sectionId,
      dayNumber: nextIncomplete.dayNumber,
    },
    orderBy: [{ order: "asc" }],
    select: {
      id: true,
      title: true,
      category: true,
      completed: true,
      dayNumber: true,
      estimatedDuration: true,
    },
  });

  return {
    currentWeek: nextIncomplete.section.weekNumber,
    currentDay: nextIncomplete.dayNumber,
    sectionTitle: nextIncomplete.section.title,
    tasks,
  };
}
