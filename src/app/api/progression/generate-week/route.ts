import { apiError, apiOk } from "@/app/api/_utils";
import { prisma } from "@/lib/db/prisma";
import { createDailyTasksFromRoadmapTasks } from "@/services/progression/progressionService";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const weekNumber: number = Number(body?.weekNumber);
    if (!weekNumber || !Number.isFinite(weekNumber)) return apiError(new Error("Invalid weekNumber"), 400);

    const section = await prisma.roadmapSection.findUnique({ where: { weekNumber }, include: { tasks: true } });
    if (!section) return apiError(new Error(`Roadmap week ${weekNumber} not found`), 404);

    // If WeeklyPlan already exists for this section, return it
    const existing = await prisma.weeklyPlan.findFirst({ where: { roadmapSectionId: section.id } });
    if (existing) {
      return apiOk({ created: false, plan: existing });
    }

    // Create a simple week range (today -> +6 days) or you can compute based on weekNumber
    const start = new Date();
    const end = new Date();
    end.setDate(start.getDate() + 6);

    const created = await prisma.weeklyPlan.create({
      data: {
        roadmapSectionId: section.id,
        weekStartDate: start,
        weekEndDate: end,
        focusTopic: section.title,
        learningRoadmap: section.title,
        completionPercentage: 0,
      },
    });

    // Create daily tasks derived from roadmap tasks for this week
    const dailyTaskIds = await createDailyTasksFromRoadmapTasks(weekNumber);

    return apiOk({ created: true, plan: created, dailyTaskIds });
  } catch (error) {
    return apiError(error, 500);
  }
}
