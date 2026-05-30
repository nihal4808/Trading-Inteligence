import { prisma } from "@/lib/db/prisma";

export async function listDiaryEntries(params?: { search?: string; tag?: string }) {
  const where = {
    ...(params?.search
      ? {
          OR: [
            { title: { contains: params.search } },
            { content: { contains: params.search } },
            { emotionalNotes: { contains: params.search } },
          ],
        }
      : {}),
    ...(params?.tag ? { tags: { contains: params.tag } } : {}),
  };

  return prisma.diaryEntry.findMany({
    where,
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });
}

export async function createDiaryEntry(input: {
  date?: string;
  title?: string;
  content?: string;
  tags?: string;
  mood?: number;
  confidence?: number;
  stress?: number;
  emotionalNotes?: string;
}) {
  return prisma.diaryEntry.create({
    data: {
      date: input.date ? new Date(input.date) : new Date(),
      title: input.title,
      content: input.content,
      tags: input.tags,
      mood: input.mood ?? 5,
      confidence: input.confidence ?? 5,
      stress: input.stress ?? 5,
      emotionalNotes: input.emotionalNotes,
    },
  });
}

export async function updateDiaryEntry(
  id: string,
  patch: Partial<{
    date: string;
    title: string;
    content: string;
    tags: string;
    mood: number;
    confidence: number;
    stress: number;
    emotionalNotes: string;
  }>
) {
  return prisma.diaryEntry.update({
    where: { id },
    data: {
      ...patch,
      date: patch.date ? new Date(patch.date) : undefined,
    },
  });
}

export async function deleteDiaryEntry(id: string) {
  await prisma.diaryEntry.delete({ where: { id } });
  return { ok: true };
}
