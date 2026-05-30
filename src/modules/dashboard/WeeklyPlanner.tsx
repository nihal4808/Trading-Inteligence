"use client";

import React, { useEffect, useState } from "react";
import { Calendar, Plus, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils/formatting";

type WeeklyPlan = {
  id: string;
  weekStartDate: string;
  weekEndDate: string;
  focusTopic: string;
  learningRoadmap?: string | null;
  movieRecommendations?: string | null;
  bookRecommendations?: string | null;
  weeklyGoals?: string | null;
  completionPercentage: number;
};

async function getPlans() {
  const res = await fetch("/api/weekly-plans", { cache: "no-store" });
  const json = await res.json();
  if (!res.ok || !json.ok) throw new Error(json.error || "Failed to load weekly plans");
  return json.data as WeeklyPlan[];
}

async function getRoadmapSections() {
  const res = await fetch("/api/roadmap", { cache: "no-store" });
  const json = await res.json();
  if (!res.ok || !json.ok) throw new Error(json.error || "Failed to load roadmap");
  return json.data.sections as unknown as Array<{ id: string; title: string; weekNumber: number }>;
}

export default function WeeklyPlannerPage() {
  const [plans, setPlans] = useState<WeeklyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    weekStartDate: "",
    weekEndDate: "",
    focusTopic: "",
    learningRoadmap: "",
    movieRecommendations: "",
    bookRecommendations: "",
    weeklyGoals: "",
  });

  const load = async () => {
    setLoading(true);
    try {
      const plans = await getPlans();
      if (plans.length === 0) {
        // If no manual plans exist, surface roadmap sections for import
        try {
          const sections = await getRoadmapSections();
          // map roadmap sections into plan-like objects for display
          setPlans(
            sections.map((s) => ({
              id: `roadmap-${s.weekNumber}`,
              weekStartDate: new Date().toISOString(),
              weekEndDate: new Date().toISOString(),
              focusTopic: s.title,
              learningRoadmap: s.title,
              movieRecommendations: null,
              bookRecommendations: null,
              weeklyGoals: null,
              completionPercentage: 0,
            })) as WeeklyPlan[]
          );
        } catch {
          setPlans([]);
        }
      } else {
        setPlans(plans);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createPlan = async () => {
    if (!form.weekStartDate || !form.weekEndDate || !form.focusTopic.trim()) return;
    await fetch("/api/weekly-plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({
      weekStartDate: "",
      weekEndDate: "",
      focusTopic: "",
      learningRoadmap: "",
      movieRecommendations: "",
      bookRecommendations: "",
      weeklyGoals: "",
    });
    await load();
  };

  const updateProgress = async (id: string, completionPercentage: number) => {
    await fetch(`/api/weekly-plans/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completionPercentage }),
    });
    await load();
  };

  const removePlan = async (id: string) => {
    await fetch(`/api/weekly-plans/${id}`, { method: "DELETE" });
    await load();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="section-title">Weekly Planner</h1>
        <p className="text-muted mt-1">Plan weeks with persistent local tracking</p>
      </div>

      <div className="card space-y-3">
        <div className="grid gap-3 md:grid-cols-2">
          <input className="input-field" type="date" value={form.weekStartDate} onChange={(e) => setForm((p) => ({ ...p, weekStartDate: e.target.value }))} />
          <input className="input-field" type="date" value={form.weekEndDate} onChange={(e) => setForm((p) => ({ ...p, weekEndDate: e.target.value }))} />
        </div>
        <input className="input-field" placeholder="Focus topic" value={form.focusTopic} onChange={(e) => setForm((p) => ({ ...p, focusTopic: e.target.value }))} />
        <textarea className="input-field" rows={2} placeholder="Learning roadmap" value={form.learningRoadmap} onChange={(e) => setForm((p) => ({ ...p, learningRoadmap: e.target.value }))} />
        <textarea className="input-field" rows={2} placeholder="Weekly goals" value={form.weeklyGoals} onChange={(e) => setForm((p) => ({ ...p, weeklyGoals: e.target.value }))} />
        <textarea className="input-field" rows={2} placeholder="Movie recommendations" value={form.movieRecommendations} onChange={(e) => setForm((p) => ({ ...p, movieRecommendations: e.target.value }))} />
        <textarea className="input-field" rows={2} placeholder="Book recommendations" value={form.bookRecommendations} onChange={(e) => setForm((p) => ({ ...p, bookRecommendations: e.target.value }))} />
        <button onClick={createPlan} className="btn btn-primary gap-2">
          <Plus className="h-4 w-4" />
          Create Weekly Plan
        </button>
      </div>

      {loading ? (
        <div className="card">Loading weekly plans...</div>
      ) : plans.length === 0 ? (
        <div className="card text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-neutral-600 mb-4" />
          <p className="text-neutral-300">No weekly plans yet</p>
          <p className="text-xs text-muted mt-2">Create your first plan to begin structured progress.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {plans.map((plan) => (
            <div key={plan.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-neutral-200">Week of {formatDate(new Date(plan.weekStartDate))}</h2>
                  <p className="text-sm text-muted mt-1">
                    {formatDate(new Date(plan.weekStartDate))} - {formatDate(new Date(plan.weekEndDate))}
                  </p>
                </div>
                <button onClick={() => removePlan(plan.id)} className="text-neutral-500 hover:text-red-400">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <p className="mt-4 text-lg font-semibold text-blue-400">{plan.focusTopic}</p>

              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-300">Progress</span>
                  <span className="font-semibold text-blue-400">{plan.completionPercentage}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={plan.completionPercentage}
                  className="w-full mt-2"
                  onChange={(e) => updateProgress(plan.id, Number(e.target.value))}
                />
              </div>

              {plan.learningRoadmap && <p className="text-sm text-neutral-300 mt-4">Roadmap: {plan.learningRoadmap}</p>}
              {plan.weeklyGoals && <p className="text-sm text-neutral-300 mt-2">Goals: {plan.weeklyGoals}</p>}
              {plan.movieRecommendations && <p className="text-sm text-neutral-400 mt-2">Movies: {plan.movieRecommendations}</p>}
              {plan.bookRecommendations && <p className="text-sm text-neutral-400 mt-2">Books: {plan.bookRecommendations}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
