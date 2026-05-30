import { prisma } from "@/lib/db/prisma";
import type { RoadmapTask } from "@prisma/client";

/**
 * Unified progression service that keeps roadmap, weekly plans, and daily tasks synchronized.
 * Roadmap is the source of truth; weekly plans and daily tasks are derived from it.
 */

export async function syncRoadmapTaskToWeekProgress(taskId: string): Promise<void> {
  // Get the task and its section
  const task = await prisma.roadmapTask.findUnique({
    where: { id: taskId },
    include: { section: true },
  });

  if (!task) return;

  // Update the weekly plan's progress (if it exists)
  const section = task.section;
  const weeklyPlan = await prisma.weeklyPlan.findUnique({
    where: { roadmapSectionId: section?.id || "" },
  });

  if (weeklyPlan) {
    // Calculate week completion percentage
    const weekTasks = await prisma.roadmapTask.findMany({
      where: { sectionId: section?.id },
    });

    const completedCount = weekTasks.filter((t) => t.completed).length;
    const completionPercentage =
      weekTasks.length > 0 ? Math.round((completedCount / weekTasks.length) * 100) : 0;

    await prisma.weeklyPlan.update({
      where: { id: weeklyPlan.id },
      data: { completionPercentage },
    });
  }
}

export async function createDailyTasksFromRoadmapTasks(
  sectionWeekNumber: number
): Promise<string[]> {
  // Find the roadmap section
  const section = await prisma.roadmapSection.findUnique({
    where: { weekNumber: sectionWeekNumber },
    include: { tasks: { orderBy: { order: "asc" } } },
  });

  if (!section) return [];

  // Group tasks by day
  const tasksByDay = new Map<number, typeof section.tasks>();
  for (const task of section.tasks) {
    if (!tasksByDay.has(task.dayNumber)) {
      tasksByDay.set(task.dayNumber, []);
    }
    tasksByDay.get(task.dayNumber)?.push(task);
  }

  const createdDailyTaskIds: string[] = [];
  const today = new Date();

  // Create daily tasks for each day
  let daysSpanned = 0;
  for (const [dayNum, dayTasks] of tasksByDay.entries()) {
    // Create one daily task per day representing the roadmap day
    const taskDate = new Date(today);
    taskDate.setDate(taskDate.getDate() + daysSpanned);

    // Combine all roadmap tasks for this day into one daily task title
    const taskTitles = dayTasks.map((t) => t.title).join(" / ");

    const dailyTask = await prisma.dailyTask.create({
      data: {
        date: taskDate,
        title: `Week ${sectionWeekNumber}: ${taskTitles.substring(0, 80)}`,
        description: `Roadmap Week ${sectionWeekNumber} Day ${dayNum} tasks`,
        category: "learning",
        priority: "high",
        roadmapTaskId: dayTasks[0]?.id, // Link to first task as primary
      },
    });

    createdDailyTaskIds.push(dailyTask.id);
    daysSpanned += 1;
  }

  return createdDailyTaskIds;
}

export async function toggleRoadmapTaskWithStatus(
  taskId: string,
  completed: boolean,
  newStatus?: string
): Promise<RoadmapTask> {
  const task = await prisma.roadmapTask.findUnique({
    where: { id: taskId },
  });

  if (!task) {
    throw new Error(`Roadmap task not found: ${taskId}`);
  }

  // Determine status
  let status = newStatus || task.status;
  if (!newStatus) {
    if (completed === false) {
      status = "not_started";
    } else if (completed === true && task.status === "completed") {
      status = "reviewed"; // If already completed, transition to reviewed
    } else if (completed === true) {
      status = "completed";
    }
  }

  const updated = await prisma.roadmapTask.update({
    where: { id: taskId },
    data: {
      completed,
      status,
      completedAt: completed ? new Date() : null,
      progressPercentage: completed ? 100 : 0,
    },
  });

  // Sync to weekly progress
  await syncRoadmapTaskToWeekProgress(taskId);

  // Update any linked daily task
  const dailyTasks = await prisma.dailyTask.findMany({
    where: { roadmapTaskId: taskId },
  });

  for (const dailyTask of dailyTasks) {
    await prisma.dailyTask.update({
      where: { id: dailyTask.id },
      data: {
        completed,
        completedAt: completed ? new Date() : null,
      },
    });
  }

  return updated;
}

export async function getCurrentWeekProgress(): Promise<{
  weekNumber: number;
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
  currentDay: number;
} | null> {
  // Get current progress record
  const progress = await prisma.roadmapProgress.findUnique({
    where: { id: "roadmap" },
  });

  if (!progress) return null;

  // Get the current week's tasks
  const currentSection = await prisma.roadmapSection.findUnique({
    where: { weekNumber: progress.currentWeek },
    include: { tasks: true },
  });

  if (!currentSection) return null;

  const totalTasks = currentSection.tasks.length;
  const completedTasks = currentSection.tasks.filter((t) => t.completed).length;
  const completionPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    weekNumber: progress.currentWeek,
    totalTasks,
    completedTasks,
    completionPercentage,
    currentDay: progress.currentDay,
  };
}

export async function getProgressionStats(): Promise<{
  currentWeek: number;
  totalWeeks: number;
  weeksCompleted: number;
  overallCompletion: number;
  tasksCompleted: number;
  tasksTotal: number;
  reviewsPending: number;
  averageConfidence: number | null;
  averageMood: number | null;
}> {
  const sections = await prisma.roadmapSection.findMany({
    include: { tasks: true },
  });

  const reviews = await prisma.roadmapReview.findMany();

  const progress = await prisma.roadmapProgress.findUnique({
    where: { id: "roadmap" },
  });

  const allTasks = sections.flatMap((s) => s.tasks);
  const completedTasks = allTasks.filter((t) => t.completed);
  const reviewedTasks = allTasks.filter((t) => t.status === "reviewed");

  const tasksNeedingReview = completedTasks.length - reviewedTasks.length;

  const confidenceLevels = reviews
    .map((r) => r.confidenceLevel)
    .filter((c) => c !== null) as number[];

  const moods = reviews
    .map((r) => r.mood)
    .filter((m) => m !== null) as number[];

  const avgConfidence =
    confidenceLevels.length > 0
      ? confidenceLevels.reduce((a, b) => a + b, 0) / confidenceLevels.length
      : null;

  const avgMood =
    moods.length > 0 ? moods.reduce((a, b) => a + b, 0) / moods.length : null;

  return {
    currentWeek: progress?.currentWeek ?? 1,
    totalWeeks: sections.length,
    weeksCompleted: sections.filter((s) => s.tasks.every((t) => t.completed)).length,
    overallCompletion:
      allTasks.length > 0
        ? Math.round((completedTasks.length / allTasks.length) * 100)
        : 0,
    tasksCompleted: completedTasks.length,
    tasksTotal: allTasks.length,
    reviewsPending: tasksNeedingReview,
    averageConfidence: avgConfidence ? Math.round(avgConfidence) : null,
    averageMood: avgMood ? Math.round(avgMood) : null,
  };
}
