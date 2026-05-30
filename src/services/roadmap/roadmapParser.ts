import { ParsedRoadmapSection, ParsedRoadmapTask, RoadmapCategory } from "./roadmapTypes";

function toInt(value: string): number | null {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : null;
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function categoryFromLabel(label: string | undefined): { category: RoadmapCategory; resourceType?: string } {
  const v = normalizeWhitespace(String(label ?? "")).toLowerCase();
  if (!v) return { category: "Other" };

  if (v === "learn" || v === "understand" || v === "focus on") return { category: "Learning" };
  if (v === "observe") return { category: "Observation" };
  if (v === "practice") return { category: "Trading Practice" };
  if (v === "review") return { category: "Review" };
  if (v === "watch" || v === "read") return { category: "Media Learning" };
  if (v === "movies") return { category: "Media Learning", resourceType: "movie" };
  if (v === "books") return { category: "Media Learning", resourceType: "book" };
  if (v === "tools") return { category: "Learning", resourceType: "tool" };

  // fallback
  if (v.includes("psych")) return { category: "Psychology" };
  if (v.includes("risk")) return { category: "Risk Management" };
  return { category: "Other" };
}

function refineCategoryByContent(base: RoadmapCategory, title: string, blockLabel?: string): RoadmapCategory {
  const t = normalizeWhitespace(title).toLowerCase();
  const b = normalizeWhitespace(String(blockLabel ?? "")).toLowerCase();

  // Explicit media blocks stay media.
  if (base === "Media Learning") return base;

  // Psychology
  if (
    /(fomo|fear|greed|tilt|discipline|patience|revenge|overtrading|impuls|emotion|mindset|confidence|anxiety|stress)/i.test(
      t
    )
  ) {
    return "Psychology";
  }

  // Risk
  if (
    /(stop\s*loss|risk\s*reward|r\s*:\s*r|position\s*siz|sizing|drawdown|max\s*loss|risk\s*management|leverage|margin)/i.test(
      t
    )
  ) {
    return "Risk Management";
  }

  // Practice
  if (/(paper\s*trad|demo\s*trad|backtest|replay|simulat|practice|journal\s*trades?)/i.test(t)) {
    return "Trading Practice";
  }

  // Observation
  if (/(observe|watch\s+charts?|charts\s+only|mark\s+levels?|scan|screen|note\s+patterns?)/i.test(t)) {
    return "Observation";
  }

  // If the block label itself implies risk/psych, let it win.
  if (b.includes("risk")) return "Risk Management";
  if (b.includes("psych")) return "Psychology";

  return base;
}

function parseEstimatedMinutes(line: string): { minutes?: number; cleaned: string } {
  // Examples: "(20m)", "~30 min", "30 minutes"
  const m = line.match(/\b(~?\d{1,3})\s*(m|min|mins|minutes)\b/i);
  if (!m) return { cleaned: line };

  const raw = m[1].replace("~", "");
  const minutes = toInt(raw) ?? undefined;
  const cleaned = normalizeWhitespace(line.replace(m[0], "").replace(/\(\s*\)/g, ""));
  return { minutes, cleaned };
}

function parseResourceHints(line: string): { resources?: string[]; cleaned: string } {
  // Very tolerant: "Resources: A, B" or "Recommended: A; B"
  const m = line.match(/\b(resources|recommended|links?)\s*:\s*(.+)$/i);
  if (!m) return { cleaned: line };

  const list = m[2]
    .split(/[,;]+/)
    .map((s) => normalizeWhitespace(s))
    .filter(Boolean);

  const cleaned = normalizeWhitespace(line.replace(m[0], ""));
  return { resources: list.length ? list : undefined, cleaned };
}

export function parseRoadmapText(text: string): ParsedRoadmapSection[] {
  const rawLines = text.replace(/\r\n/g, "\n").split("\n");

  const sections: ParsedRoadmapSection[] = [];

  let currentWeekNumber: number | null = null;
  let currentWeekTitle: string | null = null;
  let currentWeekDescription: string | undefined;

  let currentDayStart: number | null = null;
  let currentDayLabel: string | undefined;
  let currentBlockLabel: string | undefined;

  const pendingTasks: ParsedRoadmapTask[] = [];

  function flushWeek() {
    if (currentWeekNumber === null || !currentWeekTitle) return;

    if (pendingTasks.length === 0) {
      // Still allow empty sections, but importer will treat "no tasks" as invalid overall.
    }

    sections.push({
      weekNumber: currentWeekNumber,
      title: currentWeekTitle,
      description: currentWeekDescription,
      order: sections.length + 1,
      tasks: pendingTasks.splice(0, pendingTasks.length),
    });
  }

  for (const rawLine of rawLines) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();
    if (!trimmed) continue;

    // # WEEK X — TITLE
    const weekMatch = trimmed.match(/^#\s*WEEK\s+(\d{1,2})\s*[—\-]\s*(.+)$/i);
    if (weekMatch) {
      flushWeek();
      currentWeekNumber = toInt(weekMatch[1]);
      const titleRest = normalizeWhitespace(weekMatch[2]);
      currentWeekTitle = `Week ${currentWeekNumber} — ${titleRest}`;
      currentWeekDescription = undefined;
      currentDayStart = null;
      currentDayLabel = undefined;
      currentBlockLabel = undefined;
      continue;
    }

    // ### Day X–Y
    const dayMatch = trimmed.match(/^###\s*Day\s+(\d{1,2})(?:\s*[–\-]\s*(\d{1,2}))?\s*$/i);
    if (dayMatch) {
      const start = toInt(dayMatch[1]);
      const end = dayMatch[2] ? toInt(dayMatch[2]) : null;
      currentDayStart = start;

      // Preserve the exact label shape expected.
      currentDayLabel = end ? `Day ${start}–${end}` : `Day ${start}`;
      currentBlockLabel = undefined;
      continue;
    }

    // Category block headers (Learn:, Understand:, Focus on:, Observe:, Practice:, Review:, Watch:, Read:)
    const blockMatch = trimmed.match(/^([A-Za-z][A-Za-z\s]+):\s*$/);
    if (blockMatch) {
      currentBlockLabel = normalizeWhitespace(blockMatch[1]);
      continue;
    }

    // Week description (before first day)
    if (currentWeekNumber !== null && currentDayStart === null && !trimmed.startsWith("-") && !trimmed.startsWith("*") && !trimmed.startsWith("###")) {
      currentWeekDescription = currentWeekDescription
        ? `${currentWeekDescription} ${normalizeWhitespace(trimmed)}`
        : normalizeWhitespace(trimmed);
      continue;
    }

    // Bullet task
    const bulletMatch = trimmed.match(/^[-*]\s+(.+)$/);
    if (bulletMatch) {
      if (currentWeekNumber === null || currentDayStart === null) continue;
      const bulletText = normalizeWhitespace(bulletMatch[1]);
      if (!bulletText) continue;

      const { category, resourceType } = categoryFromLabel(currentBlockLabel);

      const { minutes, cleaned: title1 } = parseEstimatedMinutes(bulletText);
      const { resources, cleaned: title2 } = parseResourceHints(title1);
      const title = normalizeWhitespace(title2);
      if (!title) continue;

      const finalCategory = refineCategoryByContent(category, title, currentBlockLabel);

      const recommendedResources: ParsedRoadmapTask["recommendedResources"] = [];

      // Special blocks (Movies/Books/Tools) map the bullet itself as a typed resource.
      if (resourceType) {
        recommendedResources.push({ type: resourceType, title });
      }
      if (resources && resources.length) {
        for (const r of resources) recommendedResources.push(r);
      }

      pendingTasks.push({
        title,
        category: finalCategory,
        dayNumber: currentDayStart,
        dayLabel: currentDayLabel,
        estimatedDurationMinutes: minutes,
        recommendedResources: recommendedResources.length ? recommendedResources : undefined,
      });

      continue;
    }
  }

  flushWeek();

  // Basic cleanup: sort by week/day/order
  return sections.filter((s) => Number.isFinite(s.weekNumber));
}
