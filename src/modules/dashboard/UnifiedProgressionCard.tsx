"use client";

import React from "react";
import { TrendingUp, BookOpen, Activity } from "lucide-react";

interface ProgressionStats {
  currentWeek: number;
  totalWeeks: number;
  weeksCompleted: number;
  overallCompletion: number;
  tasksCompleted: number;
  tasksTotal: number;
  reviewsPending: number;
  averageConfidence: number | null;
  averageMood: number | null;
}

function getMoodEmoji(mood: number | null): string {
  if (!mood) return "😐";
  if (mood <= 3) return "😞";
  if (mood <= 5) return "😑";
  if (mood <= 7) return "😊";
  return "😄";
}

export default function UnifiedProgressionCard({
  stats,
}: {
  stats: ProgressionStats | null;
}) {
  if (!stats) {
    return (
      <div className="card bg-neutral-900/50 border-neutral-700">
        <div className="flex items-center gap-3">
          <Activity className="h-5 w-5 text-neutral-600" />
          <div>
            <p className="text-sm font-semibold text-neutral-300">Progression</p>
            <p className="text-xs text-muted">No progression data available</p>
          </div>
        </div>
      </div>
    );
  }

  const completion = stats.overallCompletion;
  const reviewsTotal = stats.tasksCompleted - (stats.tasksTotal - stats.reviewsPending - stats.tasksCompleted);
  const reviewPercentage = stats.tasksCompleted > 0
    ? Math.round(((stats.tasksCompleted - stats.reviewsPending) / stats.tasksCompleted) * 100)
    : 0;

  return (
    <div className="card">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Main Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-400" />
              <p className="text-sm font-semibold text-neutral-200">Roadmap Progress</p>
            </div>
            <span className="text-sm font-bold text-blue-400">{completion}%</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-neutral-400">
              <span>Week {stats.currentWeek} of {stats.totalWeeks}</span>
              <span>{stats.weeksCompleted} weeks completed</span>
            </div>
            <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all"
                style={{ width: `${completion}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-blue-950/20 border border-blue-700 rounded">
              <p className="text-neutral-400">Total Tasks</p>
              <p className="text-lg font-bold text-blue-400">{stats.tasksTotal}</p>
            </div>
            <div className="p-2 bg-green-950/20 border border-green-700 rounded">
              <p className="text-neutral-400">Completed</p>
              <p className="text-lg font-bold text-green-400">{stats.tasksCompleted}</p>
            </div>
          </div>
        </div>

        {/* Reviews & Insights */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-purple-400" />
              <p className="text-sm font-semibold text-neutral-200">Learning Insights</p>
            </div>
            <span className="text-sm font-bold text-purple-400">{reviewPercentage}%</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-neutral-400">
              <span>Reviews Completed</span>
              <span>{stats.reviewsPending} pending</span>
            </div>
            <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                style={{ width: `${reviewPercentage}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Confidence */}
            <div className="p-2 bg-yellow-950/20 border border-yellow-700 rounded">
              <p className="text-neutral-400">Confidence</p>
              <p className="text-lg font-bold text-yellow-300">
                {stats.averageConfidence ? `${stats.averageConfidence}/10` : "—"}
              </p>
            </div>

            {/* Mood */}
            <div className="p-2 bg-pink-950/20 border border-pink-700 rounded">
              <p className="text-neutral-400">Avg Mood</p>
              <p className="text-lg font-bold text-pink-300">
                {stats.averageMood ? `${getMoodEmoji(stats.averageMood)} ${stats.averageMood}/10` : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Status */}
      <div className="mt-4 pt-4 border-t border-neutral-700">
        <div className="flex items-center gap-4 text-xs text-neutral-400">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span>{stats.tasksTotal - stats.tasksCompleted} tasks remaining</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            <span>{stats.reviewsPending} reviews pending</span>
          </div>
        </div>
      </div>
    </div>
  );
}
