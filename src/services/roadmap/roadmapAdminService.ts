import { prisma } from "@/lib/db/prisma";

export async function resetRoadmap() {
  // Delete in dependency order.
  await prisma.$transaction([
    prisma.roadmapTask.deleteMany({}),
    prisma.roadmapSection.deleteMany({}),
    prisma.roadmapProgress.deleteMany({}),
  ]);

  return { ok: true };
}
