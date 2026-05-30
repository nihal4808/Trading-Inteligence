export type RoadmapCategory =
  | "Learning"
  | "Observation"
  | "Trading Practice"
  | "Psychology"
  | "Risk Management"
  | "Media Learning"
  | "Review"
  | "Other";

export type ParsedRoadmapTask = {
  title: string;
  description?: string;
  category: RoadmapCategory;
  dayNumber: number;
  dayLabel?: string;
  estimatedDurationMinutes?: number;
  recommendedResources?: Array<string | { type: string; title: string }>;
};

export type ParsedRoadmapSection = {
  title: string;
  description?: string;
  weekNumber: number;
  order: number;
  tasks: ParsedRoadmapTask[];
};

export type RoadmapImportResult =
  | { ok: true; imported: true; sectionsCreated: number; tasksCreated: number }
  | { ok: true; imported: false; reason: "already_initialized" }
  | { ok: false; error: string };
