"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import WeekCard from "./WeekCard";
import RoadmapSummaryCard from "./RoadmapSummaryCard";
import type { RoadmapApiResponse, RoadmapSection } from "./roadmapUiTypes";

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { cache: "no-store", ...init });
  const json = await res.json();
  if (!res.ok || !json.ok) {
    throw new Error(json.error || "Request failed");
  }
  return json.data as T;
}

function firstIncompleteWeek(sections: RoadmapSection[]): number | null {
  for (const s of sections) {
    if (s.tasks.some((t) => !t.completed)) return s.weekNumber;
  }
  return sections[0]?.weekNumber ?? null;
}

export default function RoadmapPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<RoadmapApiResponse | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const d = await fetchJson<RoadmapApiResponse>("/api/roadmap");
      setData(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load roadmap");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const defaultOpenWeek = useMemo(() => (data ? firstIncompleteWeek(data.sections) : null), [data]);

  const toggleTask = useCallback(
    async (id: string, completed: boolean) => {
      await fetchJson(`/api/roadmap/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed }),
      });
      await load();
    },
    [load]
  );

  if (loading) {
    return <div className="card">Loading roadmap...</div>;
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <div className="card">
          <h1 className="section-title">Roadmap</h1>
          <p className="text-red-400 mt-2">Failed to load roadmap: {error ?? "Unknown error"}</p>
          <p className="text-sm text-muted mt-3">
            The roadmap is automatically imported from <code>src/data/roadmap-source.ts</code> on startup.
            If you see this error, check the logs or restart the app.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              className="btn-primary px-4 py-2"
              onClick={async () => {
                try {
                  await fetchJson("/api/roadmap/init", { method: "POST" });
                } catch {
                  // ignore; load will show the real error
                }
                await load();
              }}
            >
              Retry
            </button>
            <Link className="btn-secondary px-4 py-2" href="/settings">
              Settings
            </Link>
          </div>
        </div>

        <div className="card">
          <h2 className="subsection-title">Roadmap Format</h2>
          <p className="text-sm text-muted mt-2">
            The roadmap uses a structured markdown format. Example:
          </p>
          <ul className="mt-3 space-y-1 text-sm text-neutral-300 list-disc pl-6">
            <li>Week 1 — Market Foundations</li>
            <li>Day 1–2 (or Day 1)</li>
            <li>Learn:, Understand:, Focus on:, etc.</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="section-title">Roadmap</h1>
          <p className="text-muted mt-1">Structured learning progression with real local persistence</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="btn-danger px-4 py-2"
            onClick={async () => {
              const ok = window.confirm(
                "Reset the roadmap? This will delete all progress and re-import from the embedded source."
              );
              if (!ok) return;
              try {
                await fetchJson("/api/roadmap/reset", { method: "POST" });
                await fetchJson("/api/roadmap/init", { method: "POST" });
              } finally {
                await load();
              }
            }}
          >
            Reset
          </button>
        </div>
      </div>

      <RoadmapSummaryCard progress={data.progress} analytics={data.analytics} />

      <div className="space-y-4">
        {data.sections.map((section) => (
          <WeekCard
            key={section.id}
            section={section}
            defaultOpen={defaultOpenWeek === section.weekNumber}
            onToggleTask={toggleTask}
          />
        ))}
      </div>
    </div>
  );
}
