import React from "react";
import type { RoadmapAnalytics, RoadmapProgress } from "./roadmapUiTypes";

function formatMinutes(totalMinutes: number) {
  if (!totalMinutes) return "0m";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (!hours) return `${minutes}m`;
  if (!minutes) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

export default function RoadmapSummaryCard(props: {
  progress: RoadmapProgress;
  analytics: RoadmapAnalytics;
}) {
  const { progress, analytics } = props;

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="subsection-title">Roadmap Progress</h2>
          <p className="text-sm text-muted mt-1">
            Week {progress.currentWeek} · Day {progress.currentDay} · {progress.completedTasks}/{progress.totalTasks} tasks
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold">{progress.completionPercentage}%</p>
          <p className="text-xs text-muted">completion</p>
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-neutral-800">
        <div
          className="h-full bg-blue-600 transition-all"
          style={{ width: `${progress.completionPercentage}%` }}
        />
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-neutral-700 bg-neutral-950/30 p-3">
          <p className="text-xs text-muted">Completed Weeks</p>
          <p className="mt-1 text-lg font-semibold">
            {analytics.completedWeeks}/{analytics.totalWeeks}
          </p>
        </div>
        <div className="rounded-lg border border-neutral-700 bg-neutral-950/30 p-3">
          <p className="text-xs text-muted">Active Focus</p>
          <p className="mt-1 text-sm font-semibold text-neutral-200 truncate">{analytics.activeFocus}</p>
        </div>
        <div className="rounded-lg border border-neutral-700 bg-neutral-950/30 p-3">
          <p className="text-xs text-muted">Remaining Time</p>
          <p className="mt-1 text-lg font-semibold">{formatMinutes(analytics.remainingMinutes)}</p>
        </div>
        <div className="rounded-lg border border-neutral-700 bg-neutral-950/30 p-3">
          <p className="text-xs text-muted">Estimated Completion</p>
          <p className="mt-1 text-lg font-semibold">~{analytics.estimatedDaysRemaining} days</p>
        </div>
      </div>

      <p className="text-xs text-muted mt-4">
        Consistency: {analytics.recentlyCompleted} tasks completed in the last 7 days
      </p>
    </div>
  );
}
