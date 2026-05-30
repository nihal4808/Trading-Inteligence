"use client";

import React, { useEffect, useMemo, useState } from "react";
import { TrendingUp, Clapperboard, Zap, PlusCircle } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils/formatting";
import Link from "next/link";

type Task = {
  id: string;
  title: string;
  category: string;
  priority: string;
  completed: boolean;
  date: string;
};

type Trade = {
  id: string;
  symbol: string;
  tradeType: string;
  profitLoss: number | null;
  date: string;
};

type AnalyticsResponse = {
  summary: {
    completionRate: number;
    winRate: number;
    totalPnL: number;
    averageMood: number;
    watchedMedia: number;
    totalMedia: number;
    totalTrades: number;
    totalLearningLogs: number;
  };
};

type RoadmapSummaryResponse = {
  progress: {
    totalTasks: number;
    completedTasks: number;
    completionPercentage: number;
    currentWeek: number;
    currentDay: number;
  };
  analytics: {
    activeFocus: string;
    remainingMinutes: number;
    estimatedDaysRemaining: number;
    completedWeeks: number;
    totalWeeks: number;
  };
  currentDay: {
    currentWeek: number;
    currentDay: number;
    sectionTitle: string | null;
    tasks: Array<{
      id: string;
      title: string;
      category: string;
      completed: boolean;
      dayNumber: number;
      estimatedDuration: number | null;
    }>;
  };
};

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  const json = await res.json();
  if (!res.ok || !json.ok) {
    throw new Error(json.error || "Request failed");
  }
  return json.data as T;
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [roadmapSummary, setRoadmapSummary] = useState<RoadmapSummaryResponse | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [analyticsData, tasksData, tradesData] = await Promise.all([
          fetchJson<AnalyticsResponse>("/api/analytics"),
          fetchJson<Task[]>("/api/daily-tasks"),
          fetchJson<Trade[]>("/api/trades"),
        ]);

        // Roadmap should not block dashboard if it's not initialized yet.
        let roadmapData: RoadmapSummaryResponse | null = null;
        try {
          roadmapData = await fetchJson<RoadmapSummaryResponse>("/api/roadmap/summary");
        } catch {
          roadmapData = null;
        }

        if (!active) return;
        setAnalytics(analyticsData);
        setTasks(tasksData);
        setTrades(tradesData);
        setRoadmapSummary(roadmapData);
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : "Failed to load dashboard");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  const todaysTasks = useMemo(() => {
    const today = new Date().toDateString();
    return tasks.filter((task) => new Date(task.date).toDateString() === today);
  }, [tasks]);

  const recentTrades = useMemo(() => trades.slice(0, 3), [trades]);

  if (loading) {
    return <div className="card">Loading dashboard...</div>;
  }

  if (error || !analytics) {
    return (
      <div className="card">
        <p className="text-red-400">Failed to load dashboard: {error ?? "Unknown error"}</p>
      </div>
    );
  }

  const s = analytics.summary;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="section-title">Welcome to Your Trading Journey</h1>
        <p className="text-muted mt-1">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted">Today&apos;s Progress</p>
              <p className="mt-2 text-3xl font-bold">{s.completionRate}%</p>
            </div>
            <div className="rounded-lg bg-blue-900/30 p-2">
              <Zap className="h-5 w-5 text-blue-400" />
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-neutral-800">
            <div className="h-full bg-blue-600 transition-all" style={{ width: `${s.completionRate}%` }} />
          </div>
        </div>

        <div className="card-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted">Win Rate</p>
              <p className="mt-2 text-3xl font-bold">{s.winRate}%</p>
            </div>
            <div className="rounded-lg bg-green-900/30 p-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
          </div>
          <p className="mt-4 text-xs text-muted">{s.totalTrades} recorded trades</p>
        </div>

        <div className="card-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted">Total P&L</p>
              <p className={`mt-2 text-3xl font-bold ${s.totalPnL >= 0 ? "text-green-400" : "text-red-400"}`}>
                {formatCurrency(s.totalPnL)}
              </p>
            </div>
            <div className={`rounded-lg p-2 ${s.totalPnL >= 0 ? "bg-green-900/30" : "bg-red-900/30"}`}>
              <TrendingUp className={`h-5 w-5 ${s.totalPnL >= 0 ? "text-green-400" : "text-red-400"}`} />
            </div>
          </div>
        </div>

        <div className="card-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted">Media Progress</p>
              <p className="mt-2 text-3xl font-bold">{s.totalMedia ? Math.round((s.watchedMedia / s.totalMedia) * 100) : 0}%</p>
            </div>
            <div className="rounded-lg bg-purple-900/30 p-2">
              <Clapperboard className="h-5 w-5 text-purple-400" />
            </div>
          </div>
          <p className="mt-4 text-xs text-muted">{s.watchedMedia}/{s.totalMedia} watched</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="subsection-title">Today&apos;s Tasks</h2>
          <div className="mt-4 space-y-2">
            {todaysTasks.length === 0 ? (
              <div className="rounded-lg border border-dashed border-neutral-700 p-6 text-center">
                <p className="text-neutral-300">No tasks added yet</p>
                <p className="text-xs text-muted mt-1">Start your trading journey by adding your first task.</p>
              </div>
            ) : (
              todaysTasks.map((task) => (
                <div key={task.id} className="flex items-start gap-3 rounded-lg border border-neutral-700 p-3">
                  <input type="checkbox" checked={task.completed} readOnly className="mt-1 rounded" />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${task.completed ? "line-through text-muted" : "text-neutral-200"}`}>
                      {task.title}
                    </p>
                    <p className="text-xs text-muted mt-1">{task.category}</p>
                  </div>
                  <span className="badge badge-info text-xs">{task.priority}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card">
          <h2 className="subsection-title">Recent Trades</h2>
          <div className="mt-4 space-y-2">
            {recentTrades.length === 0 ? (
              <div className="rounded-lg border border-dashed border-neutral-700 p-6 text-center">
                <p className="text-neutral-300">No trades added yet</p>
                <p className="text-xs text-muted mt-1">Record your first trade to unlock performance insights.</p>
              </div>
            ) : (
              recentTrades.map((trade) => (
                <div key={trade.id} className="flex items-center justify-between rounded-lg border border-neutral-700 p-3">
                  <div>
                    <p className="font-medium text-neutral-200">{trade.symbol}</p>
                    <p className="text-xs text-muted">{trade.tradeType}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${(trade.profitLoss ?? 0) >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {formatCurrency(trade.profitLoss || 0)}
                    </p>
                    <p className="text-xs text-muted">{formatDate(new Date(trade.date))}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="subsection-title">Roadmap Progress</h2>
              <p className="text-xs text-muted mt-1">Structured learning progression</p>
            </div>
            <Link href="/roadmap" className="btn-secondary px-3 py-2 text-sm">
              Open
            </Link>
          </div>

          {!roadmapSummary ? (
            <div className="mt-4 rounded-lg border border-dashed border-neutral-700 p-6 text-center">
              <p className="text-neutral-300">Roadmap not initialized yet</p>
              <p className="text-xs text-muted mt-1">Add your roadmap content and open the Roadmap page to import.</p>
            </div>
          ) : (
            <div className="mt-4">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-sm text-muted">Current</p>
                  <p className="mt-1 text-neutral-200 font-medium">
                    Week {roadmapSummary.progress.currentWeek} · Day {roadmapSummary.progress.currentDay}
                  </p>
                  <p className="text-xs text-muted mt-1 truncate">{roadmapSummary.analytics.activeFocus}</p>
                </div>
                <p className="text-3xl font-bold">{roadmapSummary.progress.completionPercentage}%</p>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-neutral-800">
                <div
                  className="h-full bg-blue-600 transition-all"
                  style={{ width: `${roadmapSummary.progress.completionPercentage}%` }}
                />
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-neutral-700 bg-neutral-950/30 p-3">
                  <p className="text-xs text-muted">Completed Weeks</p>
                  <p className="mt-1 text-sm font-semibold">
                    {roadmapSummary.analytics.completedWeeks}/{roadmapSummary.analytics.totalWeeks}
                  </p>
                </div>
                <div className="rounded-lg border border-neutral-700 bg-neutral-950/30 p-3">
                  <p className="text-xs text-muted">Estimated Completion</p>
                  <p className="mt-1 text-sm font-semibold">~{roadmapSummary.analytics.estimatedDaysRemaining} days</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="subsection-title">Today&apos;s Roadmap Tasks</h2>
          <div className="mt-4 space-y-2">
            {!roadmapSummary ? (
              <div className="rounded-lg border border-dashed border-neutral-700 p-6 text-center">
                <p className="text-neutral-300">No roadmap tasks yet</p>
                <p className="text-xs text-muted mt-1">Import your roadmap to start progressing.</p>
              </div>
            ) : roadmapSummary.currentDay.tasks.length === 0 ? (
              <div className="rounded-lg border border-dashed border-neutral-700 p-6 text-center">
                <p className="text-neutral-300">Roadmap complete</p>
                <p className="text-xs text-muted mt-1">All roadmap tasks are completed.</p>
              </div>
            ) : (
              roadmapSummary.currentDay.tasks.map((t) => (
                <div key={t.id} className="flex items-start gap-3 rounded-lg border border-neutral-700 p-3">
                  <input type="checkbox" checked={t.completed} readOnly className="mt-1 rounded" />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${t.completed ? "line-through text-muted" : "text-neutral-200"}`}>
                      {t.title}
                    </p>
                    <p className="text-xs text-muted mt-1">{t.category}</p>
                  </div>
                  {typeof t.estimatedDuration === "number" && t.estimatedDuration > 0 && (
                    <span className="badge badge-info text-xs">{t.estimatedDuration}m</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {tasks.length === 0 && trades.length === 0 && (
        <div className="card border-blue-900/40 bg-blue-900/10">
          <div className="flex items-start gap-3">
            <PlusCircle className="h-5 w-5 text-blue-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-300">Fresh Start Initialized</h3>
              <p className="text-sm text-blue-200 mt-1">
                Your workspace is clean with zero fake progress. Add your first task, trade, and media review to begin.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
