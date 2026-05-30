export type RoadmapTask = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  dayNumber: number;
  dayLabel: string | null;
  estimatedDuration: number | null;
  recommendedResources: string | null;
  completed: boolean;
  completedAt: string | null;
    status: string;
    progressPercentage: number;
    notes: string | null;
  order: number;
};

export type RoadmapSection = {
  id: string;
  title: string;
  description: string | null;
  weekNumber: number;
  order: number;
  tasks: RoadmapTask[];
};

export type RoadmapProgress = {
  id: string;
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
  currentWeek: number;
  currentDay: number;
  updatedAt: string;
};

export type RoadmapAnalytics = {
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
  completedWeeks: number;
  totalWeeks: number;
  currentWeek: number;
  currentDay: number;
  activeFocus: string;
  remainingMinutes: number;
  recentlyCompleted: number;
  estimatedDaysRemaining: number;
};

export type RoadmapApiResponse = {
  sections: RoadmapSection[];
  progress: RoadmapProgress;
  analytics: RoadmapAnalytics;
  init: { ok: true; imported: boolean; reason?: string; sectionsCreated?: number; tasksCreated?: number };
};
