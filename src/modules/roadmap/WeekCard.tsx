import React, { useMemo, useState } from "react";
import type { RoadmapSection, RoadmapTask } from "./roadmapUiTypes";
import RoadmapTaskCard from "./RoadmapTaskCard";

function percent(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

function groupByDayLabel(tasks: RoadmapTask[]) {
  const map = new Map<string, { sortKey: number; label: string; tasks: RoadmapTask[] }>();

  for (const t of tasks) {
    const label = (t.dayLabel || `Day ${t.dayNumber}`).trim();
    const existing = map.get(label);
    if (existing) {
      existing.tasks.push(t);
    } else {
      map.set(label, { sortKey: t.dayNumber, label, tasks: [t] });
    }
  }

  return [...map.values()].sort((a, b) => a.sortKey - b.sortKey);
}

export default function WeekCard(props: {
  section: RoadmapSection;
  defaultOpen?: boolean;
  onToggleTask: (id: string, completed: boolean) => Promise<void>;
  onReview?: (taskId: string, taskTitle: string) => void;
  onMarkReviewed?: (taskId: string) => Promise<void>;
}) {
  const { section, defaultOpen, onToggleTask, onReview, onMarkReviewed } = props;
  const [open, setOpen] = useState(Boolean(defaultOpen));

  const completed = useMemo(() => section.tasks.filter((t) => t.completed).length, [section.tasks]);
  const total = section.tasks.length;
  const completion = percent(completed, total);

  const grouped = useMemo(() => groupByDayLabel(section.tasks), [section.tasks]);

  return (
    <div className="card">
      <button
        type="button"
        className="w-full text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="subsection-title truncate">{section.title}</h3>
            {section.description && <p className="text-sm text-muted mt-1">{section.description}</p>}
            <p className="text-xs text-muted mt-2">
              {completed}/{total} tasks · {completion}% complete
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-24 h-2 overflow-hidden rounded-full bg-neutral-800">
              <div className="h-full bg-blue-600 transition-all" style={{ width: `${completion}%` }} />
            </div>
            <span className="text-sm font-semibold">{open ? "−" : "+"}</span>
          </div>
        </div>
      </button>

      <div
        className={`grid transition-all ${open ? "mt-5 opacity-100" : "mt-0 opacity-0 pointer-events-none"}`}
      >
        <div className="space-y-6">
          {grouped.map((group) => (
            <div key={group.label}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-neutral-200">{group.label}</p>
                <p className="text-xs text-muted">
                  {group.tasks.filter((t) => t.completed).length}/{group.tasks.length} complete
                </p>
              </div>
              <div className="mt-3 space-y-2">
                {group.tasks.map((task) => (
                  <RoadmapTaskCard
                    key={task.id}
                    task={task}
                    onToggle={onToggleTask}
                    onReview={onReview ? (id) => onReview(id, task.title) : undefined}
                    onMarkReviewed={onMarkReviewed}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
