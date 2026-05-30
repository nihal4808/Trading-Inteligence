import { ROADMAP_MARKDOWN } from "@/data/roadmap-source";

export function getRoadmapSourcePath(): string {
  // Deprecated: kept for logging purposes only.
  // The actual source is now embedded in src/data/roadmap-source.ts
  return "src/data/roadmap-source.ts (embedded)";
}

export function readRoadmapSourceText(): string {
  // Read from the embedded internal roadmap source module.
  const text = ROADMAP_MARKDOWN.trim();
  if (!text) {
    throw new Error(
      "Roadmap markup is empty. Please check src/data/roadmap-source.ts."
    );
  }

  return text;
}
