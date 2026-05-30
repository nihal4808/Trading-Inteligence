import React, { useMemo, useState } from "react";
import type { RoadmapTask } from "./roadmapUiTypes";

function badgeClass(category: string) {
  const c = category.toLowerCase();
  if (c.includes("psych")) return "badge badge-warning";
  if (c.includes("risk")) return "badge badge-danger";
  if (c.includes("media")) return "badge badge-info";
  if (c.includes("practice")) return "badge badge-success";
  if (c.includes("review")) return "badge badge-info";
  return "badge badge-info";
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

export default function RoadmapTaskRow(props: {
  task: RoadmapTask;
  onToggle: (id: string, completed: boolean) => Promise<void>;
}) {
  const { task, onToggle } = props;
  const [busy, setBusy] = useState(false);

  const resources = useMemo(() => parseResources(task.recommendedResources), [task.recommendedResources]);

  return (
    <div className="flex items-start gap-3 rounded-lg border border-neutral-700 p-3">
      <input
        type="checkbox"
        className="mt-1 rounded"
        checked={task.completed}
        disabled={busy}
        onChange={async (e) => {
          setBusy(true);
          try {
            await onToggle(task.id, e.target.checked);
          } finally {
            setBusy(false);
          }
        }}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <p className={`text-sm font-medium ${task.completed ? "line-through text-muted" : "text-neutral-200"}`}>
            {task.title}
          </p>
          <span className={badgeClass(task.category)} style={{ fontSize: 12 }}>
            {task.category}
          </span>
        </div>

        {(task.description || task.estimatedDuration || resources.length > 0) && (
          <div className="mt-2 space-y-1">
            {task.description && <p className="text-xs text-muted">{task.description}</p>}
            {typeof task.estimatedDuration === "number" && task.estimatedDuration > 0 && (
              <p className="text-xs text-subtle">Estimated: {task.estimatedDuration} min</p>
            )}
            {resources.length > 0 && (
              <p className="text-xs text-subtle truncate">Resources: {resources.join(", ")}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
