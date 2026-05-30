"use client";

import React, { useMemo, useState } from "react";
import { MessageSquare, Lightbulb } from "lucide-react";
import type { RoadmapTask } from "./roadmapUiTypes";

interface RoadmapTaskWithReview extends RoadmapTask {
  review?: {
    review?: string;
    reflection?: string;
    mood?: number;
    confidenceLevel?: number;
    difficultyLevel?: number;
    lessonsLearned?: string;
  };
}

function badgeClass(category: string) {
  const c = category.toLowerCase();
  if (c.includes("psych")) return "bg-yellow-900 text-yellow-200";
  if (c.includes("risk")) return "bg-red-900 text-red-200";
  if (c.includes("media")) return "bg-cyan-900 text-cyan-200";
  if (c.includes("practice")) return "bg-green-900 text-green-200";
  if (c.includes("review")) return "bg-blue-900 text-blue-200";
  return "bg-neutral-700 text-neutral-300";
}

function statusBadge(status: string) {
  const s = status.toLowerCase();
  if (s === "not_started") return "bg-neutral-700 text-neutral-300";
  if (s === "in_progress") return "bg-blue-900 text-blue-200";
  if (s === "completed") return "bg-green-900 text-green-200";
  if (s === "reviewed") return "bg-purple-900 text-purple-200";
  return "bg-neutral-700 text-neutral-300";
}

function parseResources(value: string | null): string[] {
  if (!value) return [];
  try {
    const json = JSON.parse(value);
    if (Array.isArray(json)) {
      return json
        .map((x) => {
          if (typeof x === "string") return x;
          if (x && typeof x === "object") {
            const rec = x as Record<string, unknown>;
            const type = String(rec.type ?? "").trim();
            const title = String(rec.title ?? "").trim();
            if (type && title) return `${type}: ${title}`;
            if (title) return title;
          }
          return "";
        })
        .map((s) => String(s).trim())
        .filter(Boolean);
    }
  } catch {
    // ignore
  }
  return [];
}

export default function RoadmapTaskCard(props: {
  task: RoadmapTaskWithReview;
  onToggle: (id: string, completed: boolean, status?: string) => Promise<void>;
  onReview?: (id: string) => void;
  onMarkReviewed?: (id: string) => void;
}) {
  const { task, onToggle, onReview, onMarkReviewed } = props;
  const [busy, setBusy] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const resources = useMemo(() => parseResources(task.recommendedResources), [task.recommendedResources]);

  const handleToggle = async () => {
    setBusy(true);
    try {
      const newCompleted = !task.completed;
      const newStatus = newCompleted ? "in_progress" : "not_started";
      await onToggle(task.id, newCompleted, newStatus);
    } finally {
      setBusy(false);
    }
  };

  const handleMarkReviewed = async () => {
    if (onMarkReviewed) {
      onMarkReviewed(task.id);
    }
  };

  return (
    <div className={`rounded-lg border p-4 transition ${
      task.completed
        ? "border-green-700 bg-green-950/20"
        : task.status === "in_progress"
        ? "border-blue-700 bg-blue-950/20"
        : "border-neutral-700 bg-neutral-900/20"
    }`}>
      {/* Header with checkbox and title */}
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          className="mt-1 rounded cursor-pointer"
          checked={task.completed}
          disabled={busy}
          onChange={handleToggle}
        />

        <div className="flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p
                className={`text-sm font-medium cursor-pointer ${
                  task.completed ? "line-through text-muted" : "text-neutral-200"
                }`}
                onClick={() => setExpanded(!expanded)}
              >
                {task.title}
              </p>
              {task.dayLabel && (
                <p className="text-xs text-subtle mt-1">{task.dayLabel}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded text-xs font-medium ${badgeClass(task.category)}`}>
                {task.category}
              </span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${statusBadge(task.status)}`}>
                {task.status.replace(/_/g, " ")}
              </span>
            </div>
          </div>

          {/* Show when expanded or completed */}
          {(expanded || task.completed) && (
            <div className="mt-3 space-y-2">
              {task.description && (
                <p className="text-xs text-muted">{task.description}</p>
              )}

              {typeof task.estimatedDuration === "number" && task.estimatedDuration > 0 && (
                <p className="text-xs text-subtle">⏱ Estimated: {task.estimatedDuration} min</p>
              )}

              {task.progressPercentage > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-neutral-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition"
                      style={{ width: `${Math.min(task.progressPercentage, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-subtle">{task.progressPercentage}%</span>
                </div>
              )}

              {resources.length > 0 && (
                <div className="text-xs text-subtle">
                  📚 {resources.join(" • ")}
                </div>
              )}

              {task.notes && (
                <div className="mt-2 p-2 bg-neutral-800 rounded text-xs text-neutral-300">
                  <p className="font-semibold text-neutral-400 mb-1">Notes:</p>
                  {task.notes}
                </div>
              )}

              {/* Review Summary */}
              {task.review && (
                <div className="mt-3 space-y-1 p-2 bg-purple-950/30 border border-purple-700 rounded">
                  <p className="text-xs font-semibold text-purple-300">Review Summary</p>
                  {task.review.confidenceLevel && (
                    <p className="text-xs text-neutral-300">
                      Confidence: <span className="text-purple-300">{task.review.confidenceLevel}/10</span>
                    </p>
                  )}
                  {task.review.mood && (
                    <p className="text-xs text-neutral-300">
                      Mood: <span className="text-purple-300">{task.review.mood}/10</span>
                    </p>
                  )}
                  {task.review.difficultyLevel && (
                    <p className="text-xs text-neutral-300">
                      Difficulty: <span className="text-purple-300">{task.review.difficultyLevel}/10</span>
                    </p>
                  )}

                  {task.status === "reviewed" && (
                    <p className="text-xs text-green-300 mt-2">✓ Reviewed</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      {task.completed && (
        <div className="mt-3 flex items-center gap-2 pt-3 border-t border-neutral-700">
          {task.status !== "reviewed" ? (
            <>
              <button
                className="btn btn-small btn-primary gap-1 text-xs"
                onClick={() => onReview?.(task.id)}
              >
                <MessageSquare className="h-3 w-3" />
                Add Review
              </button>
              {onMarkReviewed && (
                <button
                  className="btn btn-small btn-secondary gap-1 text-xs"
                  onClick={handleMarkReviewed}
                >
                  <Lightbulb className="h-3 w-3" />
                  Mark Reviewed
                </button>
              )}
            </>
          ) : (
            <p className="text-xs text-green-300 flex items-center gap-1">
              <Lightbulb className="h-3 w-3" />
              Reviewed
            </p>
          )}
        </div>
      )}
    </div>
  );
}
