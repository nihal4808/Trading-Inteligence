import { prisma } from "@/lib/db/prisma";

import { parseRoadmapText } from "./roadmapParser";
import { readRoadmapSourceText } from "./roadmapSource";
import type { ParsedRoadmapSection, RoadmapImportResult } from "./roadmapTypes";

function serializeResources(resources: Array<string | { type: string; title: string }> | undefined): string | null {
  if (!resources || resources.length === 0) return null;
  return JSON.stringify(resources);
}

function looksLikeTitle(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  if (v.includes("http://") || v.includes("https://")) return false;
  if (v.length > 80) return false;
  const words = v.split(/\s+/).filter(Boolean);
  if (words.length < 2) return false;
  // Heuristic: at least 2 words start with a capital letter.
  const caps = words.filter((w) => /^[A-Z]/.test(w)).length;
  return caps >= 2;
}

function extractTypedMedia(sections: ParsedRoadmapSection[]): Array<{ title: string; mediaType: "movie" | "book" }> {
  const out = new Map<string, { title: string; mediaType: "movie" | "book" }>();

  for (const section of sections) {
    for (const task of section.tasks) {
      for (const r of task.recommendedResources ?? []) {
        if (typeof r === "string") continue;
        const type = String(r.type ?? "").toLowerCase();
        const title = String(r.title ?? "").trim();
        if (!title) continue;
        if (type === "movie") out.set(title.toLowerCase(), { title, mediaType: "movie" });
        if (type === "book") out.set(title.toLowerCase(), { title, mediaType: "book" });
      }

      // Fallback heuristic: media-learning tasks may be titles.
      if (task.category === "Media Learning") {
        const candidate = task.title.trim();
        if (looksLikeTitle(candidate) && !out.has(candidate.toLowerCase())) {
          out.set(candidate.toLowerCase(), { title: candidate, mediaType: "movie" });
        }
      }
    }
  }

  return [...out.values()];
}

async function ensureMediaLibraryEntriesForTypedItems(items: Array<{ title: string; mediaType: "movie" | "book" }>) {
  if (items.length === 0) return;

  const existing = await prisma.mediaItem.findMany({ select: { title: true } });
  const existingSet = new Set(existing.map((m) => m.title.trim().toLowerCase()));

  const missing = items.filter((i) => !existingSet.has(i.title.trim().toLowerCase()));
  if (missing.length === 0) return;

  await prisma.mediaItem.createMany({
    data: missing.map((item) => ({
      title: item.title,
      mediaType: item.mediaType,
      status: "unwatched",
      category: "trading",
      rating: null,
      review: null,
      lessonsLearned: null,
      emotionalImpact: null,
      watchedAt: null,
    })),
  });
}

function validateParsed(sections: ParsedRoadmapSection[]): { ok: true } | { ok: false; error: string } {
  if (sections.length === 0) {
    return { ok: false, error: "Roadmap parser found 0 weeks. Ensure your source has Week headings (e.g. 'Week 1 — ...')." };
  }

  const totalTasks = sections.reduce((sum, s) => sum + s.tasks.length, 0);
  if (totalTasks === 0) {
    return { ok: false, error: "Roadmap parser found 0 tasks. Ensure each Day has bullet tasks beneath it." };
  }

  // Sanity: ensure week numbers unique
  const weekNums = new Set<number>();
  for (const s of sections) {
    if (weekNums.has(s.weekNumber)) {
      return { ok: false, error: `Duplicate Week ${s.weekNumber} detected in roadmap source.` };
    }
    weekNums.add(s.weekNumber);
  }

  return { ok: true };
}

export async function importRoadmapOnce(): Promise<RoadmapImportResult> {
  const existing = await prisma.roadmapSection.count();
  if (existing > 0) {
    return { ok: true, imported: false, reason: "already_initialized" };
  }

  try {
    const text = readRoadmapSourceText();
    const parsed = parseRoadmapText(text);

    const valid = validateParsed(parsed);
    if (!valid.ok) return { ok: false, error: valid.error };

    const typedMedia = extractTypedMedia(parsed);
    await ensureMediaLibraryEntriesForTypedItems(typedMedia);

    const created = await prisma.$transaction(async (tx) => {
      let sectionsCreated = 0;
      let tasksCreated = 0;

      for (const section of parsed.sort((a, b) => a.weekNumber - b.weekNumber)) {
        const createdSection = await tx.roadmapSection.create({
          data: {
            title: section.title,
            description: section.description ?? null,
            weekNumber: section.weekNumber,
            order: section.order,
          },
        });
        sectionsCreated += 1;

        if (section.tasks.length > 0) {
          await tx.roadmapTask.createMany({
            data: section.tasks
              .map((t, idx) => ({
                sectionId: createdSection.id,
                title: t.title,
                description: t.description ?? null,
                category: t.category,
                dayNumber: t.dayNumber,
                dayLabel: t.dayLabel ?? null,
                estimatedDuration: t.estimatedDurationMinutes ?? null,
                recommendedResources: serializeResources(t.recommendedResources),
                completed: false,
                completedAt: null,
                order: idx + 1,
              })),
          });
          tasksCreated += section.tasks.length;
        }
      }

      const progress = await tx.roadmapProgress.upsert({
        where: { id: "roadmap" },
        create: {
          id: "roadmap",
          totalTasks: tasksCreated,
          completedTasks: 0,
          completionPercentage: 0,
          currentWeek: parsed[0].weekNumber,
          currentDay: parsed[0].tasks.length ? parsed[0].tasks[0].dayNumber : 1,
        },
        update: {
          totalTasks: tasksCreated,
          completedTasks: 0,
          completionPercentage: 0,
          currentWeek: parsed[0].weekNumber,
          currentDay: parsed[0].tasks.length ? parsed[0].tasks[0].dayNumber : 1,
        },
      });

      return { sectionsCreated, tasksCreated, progress };
    });

    return {
      ok: true,
      imported: true,
      sectionsCreated: created.sectionsCreated,
      tasksCreated: created.tasksCreated,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Roadmap import failed";
    // Concurrency safety: two init calls can race; treat the unique constraint as already initialized.
    if (/unique constraint failed/i.test(msg) || /unique constraint/i.test(msg)) {
      return { ok: true, imported: false, reason: "already_initialized" };
    }
    return { ok: false, error: msg };
  }
}
