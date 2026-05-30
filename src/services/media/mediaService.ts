import { prisma } from "@/lib/db/prisma";

const STARTER_MEDIA: Array<{ title: string; mediaType: string; category?: string }> = [
  { title: "The Big Short", mediaType: "movie", category: "trading" },
  { title: "Margin Call", mediaType: "movie", category: "trading" },
  { title: "The Wolf of Wall Street", mediaType: "movie", category: "psychology" },
  { title: "Moneyball", mediaType: "movie", category: "mindset" },
  { title: "Inside Job", mediaType: "documentary", category: "finance" },
];

function normalizeMediaType(value: unknown): string {
  const v = String(value ?? "").trim().toLowerCase();
  if (v === "movie" || v === "documentary" || v === "book" || v === "podcast") return v;
  throw new Error("Invalid mediaType");
}

function normalizeMediaStatus(value: unknown): string {
  const v = String(value ?? "").trim().toLowerCase();
  if (v === "unwatched" || v === "watching" || v === "watched") return v;
  throw new Error("Invalid status (use unwatched|watching|watched)");
}

async function ensureStarterMedia() {
  const count = await prisma.mediaItem.count();
  if (count > 0) return;

  await prisma.mediaItem.createMany({
    data: STARTER_MEDIA.map((m) => ({
      title: m.title,
      category: m.category,
      mediaType: m.mediaType,
      status: "unwatched",
      rating: null,
      review: null,
      lessonsLearned: null,
      emotionalImpact: null,
      watchedAt: null,
    })),
  });
}

export async function listMedia(params?: { status?: string; category?: string; mediaType?: string }) {
  await ensureStarterMedia();

  return prisma.mediaItem.findMany({
    where: {
      ...(params?.status ? { status: normalizeMediaStatus(params.status) } : {}),
      ...(params?.mediaType ? { mediaType: normalizeMediaType(params.mediaType) } : {}),
      ...(params?.category ? { category: params.category } : {}),
    },
    orderBy: [{ createdAt: "desc" }],
  });
}

export async function createMedia(input: {
  title: string;
  category?: string;
  mediaType: string;
  status?: string;
  rating?: number;
  review?: string;
  lessonsLearned?: string;
  emotionalImpact?: string;
  watchedAt?: string;
}) {
  return prisma.mediaItem.create({
    data: {
      title: input.title,
      category: input.category,
      mediaType: normalizeMediaType(input.mediaType),
      status: input.status ? normalizeMediaStatus(input.status) : "unwatched",
      rating: input.rating,
      review: input.review,
      lessonsLearned: input.lessonsLearned,
      emotionalImpact: input.emotionalImpact,
      watchedAt: input.watchedAt ? new Date(input.watchedAt) : null,
    },
  });
}

export async function updateMedia(
  id: string,
  patch: Partial<{
    title: string;
    category: string;
    mediaType: string;
    status: string;
    rating: number | null;
    review: string;
    lessonsLearned: string;
    emotionalImpact: string;
    watchedAt: string | null;
  }>
) {
  return prisma.mediaItem.update({
    where: { id },
    data: {
      title: patch.title,
      category: patch.category,
      mediaType: patch.mediaType ? normalizeMediaType(patch.mediaType) : undefined,
      status: patch.status ? normalizeMediaStatus(patch.status) : undefined,
      rating: patch.rating,
      review: patch.review,
      lessonsLearned: patch.lessonsLearned,
      emotionalImpact: patch.emotionalImpact,
      watchedAt:
        patch.watchedAt === null
          ? null
          : patch.watchedAt
          ? new Date(patch.watchedAt)
          : undefined,
    },
  });
}

export async function deleteMedia(id: string) {
  await prisma.mediaItem.delete({ where: { id } });
  return { ok: true };
}
