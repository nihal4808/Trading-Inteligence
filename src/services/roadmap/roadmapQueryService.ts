import { prisma } from "@/lib/db/prisma";

export async function getRoadmapSectionsWithTasks() {
  return prisma.roadmapSection.findMany({
    orderBy: [{ weekNumber: "asc" }, { order: "asc" }],
    include: {
      tasks: {
        orderBy: [{ dayNumber: "asc" }, { order: "asc" }, { createdAt: "asc" }],
      },
    },
  });
}

export async function getRoadmapTaskById(id: string) {
  return prisma.roadmapTask.findUnique({ where: { id } });
}
