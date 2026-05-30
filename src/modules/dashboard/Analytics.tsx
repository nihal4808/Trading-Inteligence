"use client";

import React, { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type AnalyticsData = {
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
  emotionalTrend: Array<{
    day: string;
    mood: number;
    confidence: number;
    stress: number;
  }>;
  mediaImpact: Array<{
    title: string;
    insight: number;
  }>;
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/analytics", { cache: "no-store" });
        const json = await res.json();
        if (!res.ok || !json.ok) throw new Error(json.error || "Failed to load analytics");
        if (!active) return;
        setData(json.data);
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : "Analytics loading failed");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <div className="card">Loading analytics...</div>;
  if (error || !data) {
    return <div className="card text-red-400">{error || "Failed to load analytics"}</div>;
  }

  const winRateData = [
    { metric: "Completion", value: data.summary.completionRate },
    { metric: "Win Rate", value: data.summary.winRate },
    { metric: "Mood", value: data.summary.averageMood * 10 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="section-title">Analytics & Insights</h1>
        <p className="text-muted mt-1">Real local performance intelligence</p>
      </div>

      {data.summary.totalTrades === 0 && data.summary.totalLearningLogs === 0 ? (
        <div className="card text-center py-12">
          <p className="text-neutral-300">No analytics yet</p>
          <p className="text-xs text-muted mt-2">Add trades, diary entries, and learning logs to unlock insights.</p>
        </div>
      ) : (
        <>
          <div className="card">
            <h2 className="subsection-title">Core Metrics</h2>
            <div className="mt-6">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={winRateData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                  <XAxis dataKey="metric" stroke="#999" />
                  <YAxis stroke="#999" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a1a",
                      border: "1px solid #404040",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="value" fill="#2563eb" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <h2 className="subsection-title">Emotional Trend</h2>
            <div className="mt-6">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={data.emotionalTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                  <XAxis dataKey="day" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a1a",
                      border: "1px solid #404040",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="mood" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="confidence" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="stress" stroke="#ef4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <h2 className="subsection-title">Media Insight Ratings</h2>
            {data.mediaImpact.length === 0 ? (
              <p className="text-sm text-muted mt-4">No rated media yet. Add reviews and ratings to see impact trends.</p>
            ) : (
              <div className="mt-6">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={data.mediaImpact}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                    <XAxis dataKey="title" stroke="#999" />
                    <YAxis stroke="#999" domain={[0, 10]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a1a",
                        border: "1px solid #404040",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="insight" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
