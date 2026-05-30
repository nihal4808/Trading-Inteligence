import { prisma } from "@/lib/db/prisma";

export async function listTasks(category?: string) {
  return prisma.dailyTask.findMany({
    where: category ? { category } : undefined,
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });
}

export async function createTask(input: {
  title: string;
  description?: string;
  date?: string;
  category: string;
  priority?: string;
}) {
  return prisma.dailyTask.create({
    data: {
      title: input.title,
      description: input.description,
      date: input.date ? new Date(input.date) : new Date(),
      category: input.category,
      priority: input.priority ?? "medium",
      completed: false,
    },
  });
}

export async function updateTask(
  id: string,
  patch: Partial<{
    title: string;
    description: string;
    category: string;
    priority: string;
    date: string;
    completed: boolean;
    notes: string;
  }>
) {
  return prisma.dailyTask.update({
    where: { id },
    data: {
      ...patch,
      date: patch.date ? new Date(patch.date) : undefined,
      completedAt:
        patch.completed === true
          ? new Date()
          : patch.completed === false
          ? null
          : undefined,
    },
  });
}

export async function deleteTask(id: string) {
  await prisma.dailyTask.delete({ where: { id } });
  return { ok: true };
}
