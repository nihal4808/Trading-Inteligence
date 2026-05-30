import { prisma } from "@/lib/db/prisma";

export async function listLearningLogs() {
  return prisma.learningLog.findMany({ orderBy: [{ date: "desc" }, { createdAt: "desc" }] });
}

export async function createLearningLog(input: {
  topic: string;
  lessonTitle: string;
  source?: string;
  duration?: number;
  keyTakeaways?: string;
  difficulty?: string;
  completed?: boolean;
  proficiencyLevel?: number;
  date?: string;
}) {
  return prisma.learningLog.create({
    data: {
      topic: input.topic,
      lessonTitle: input.lessonTitle,
      source: input.source,
      duration: input.duration,
      keyTakeaways: input.keyTakeaways,
      difficulty: input.difficulty,
      completed: input.completed ?? false,
      proficiencyLevel: input.proficiencyLevel ?? 0,
      date: input.date ? new Date(input.date) : new Date(),
    },
  });
}

export async function updateLearningLog(
  id: string,
  patch: Partial<{
    topic: string;
    lessonTitle: string;
    source: string;
    duration: number;
    keyTakeaways: string;
    difficulty: string;
    completed: boolean;
    proficiencyLevel: number;
    date: string;
  }>
) {
  return prisma.learningLog.update({
    where: { id },
    data: {
      ...patch,
      date: patch.date ? new Date(patch.date) : undefined,
    },
  });
}

export async function deleteLearningLog(id: string) {
  await prisma.learningLog.delete({ where: { id } });
  return { ok: true };
}
