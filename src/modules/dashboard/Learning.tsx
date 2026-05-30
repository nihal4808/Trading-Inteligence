"use client";

import React, { useEffect, useMemo, useState } from "react";
import { BookOpen, Plus, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils/formatting";

type LearningLog = {
  id: string;
  date: string;
  topic: string;
  lessonTitle: string;
  source?: string | null;
  duration?: number | null;
  keyTakeaways?: string | null;
  difficulty?: string | null;
  completed: boolean;
  proficiencyLevel: number;
};

async function getLogs() {
  const res = await fetch("/api/learning", { cache: "no-store" });
  const json = await res.json();
  if (!res.ok || !json.ok) throw new Error(json.error || "Failed to load learning logs");
  return json.data as LearningLog[];
}

export default function LearningPage() {
  const [logs, setLogs] = useState<LearningLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    topic: "",
    lessonTitle: "",
    source: "",
    duration: "",
    keyTakeaways: "",
    difficulty: "beginner",
    proficiencyLevel: "0",
  });

  const load = async () => {
    setLoading(true);
    try {
      setLogs(await getLogs());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const topics = useMemo(() => Array.from(new Set(logs.map((l) => l.topic))), [logs]);

  const totalHours = useMemo(
    () => logs.reduce((sum, l) => sum + (l.duration || 0), 0) / 60,
    [logs]
  );

  const createLog = async () => {
    if (!form.topic.trim() || !form.lessonTitle.trim()) return;
    await fetch("/api/learning", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: form.topic,
        lessonTitle: form.lessonTitle,
        source: form.source || undefined,
        duration: form.duration ? Number(form.duration) : undefined,
        keyTakeaways: form.keyTakeaways || undefined,
        difficulty: form.difficulty,
        proficiencyLevel: Number(form.proficiencyLevel),
      }),
    });
    setForm({
      topic: "",
      lessonTitle: "",
      source: "",
      duration: "",
      keyTakeaways: "",
      difficulty: "beginner",
      proficiencyLevel: "0",
    });
    await load();
  };

  const toggleCompleted = async (log: LearningLog) => {
    await fetch(`/api/learning/${log.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !log.completed }),
    });
    await load();
  };

  const deleteLog = async (id: string) => {
    await fetch(`/api/learning/${id}`, { method: "DELETE" });
    await load();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="section-title">Learning Progress</h1>
        <p className="text-muted mt-1">Track what you learn with persistent records</p>
      </div>

      <div className="card">
        <div className="grid gap-3 md:grid-cols-3">
          <input className="input-field" placeholder="Topic" value={form.topic} onChange={(e) => setForm((p) => ({ ...p, topic: e.target.value }))} />
          <input className="input-field" placeholder="Lesson title" value={form.lessonTitle} onChange={(e) => setForm((p) => ({ ...p, lessonTitle: e.target.value }))} />
          <input className="input-field" placeholder="Source" value={form.source} onChange={(e) => setForm((p) => ({ ...p, source: e.target.value }))} />
          <input className="input-field" type="number" placeholder="Duration (minutes)" value={form.duration} onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))} />
          <select className="input-field" value={form.difficulty} onChange={(e) => setForm((p) => ({ ...p, difficulty: e.target.value }))}>
            <option value="beginner">beginner</option>
            <option value="intermediate">intermediate</option>
            <option value="advanced">advanced</option>
          </select>
          <input className="input-field" type="number" min={0} max={100} placeholder="Proficiency %" value={form.proficiencyLevel} onChange={(e) => setForm((p) => ({ ...p, proficiencyLevel: e.target.value }))} />
          <textarea className="input-field md:col-span-3" rows={2} placeholder="Key takeaways" value={form.keyTakeaways} onChange={(e) => setForm((p) => ({ ...p, keyTakeaways: e.target.value }))} />
          <button onClick={createLog} className="btn btn-primary md:col-span-3 gap-2">
            <Plus className="h-4 w-4" />
            Add Learning Log
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card-sm">
          <p className="text-sm text-muted">Total Hours</p>
          <p className="mt-2 text-3xl font-bold">{totalHours.toFixed(1)}h</p>
        </div>
        <div className="card-sm">
          <p className="text-sm text-muted">Lessons Completed</p>
          <p className="mt-2 text-3xl font-bold">{logs.filter((l) => l.completed).length}</p>
        </div>
        <div className="card-sm">
          <p className="text-sm text-muted">Topics</p>
          <p className="mt-2 text-3xl font-bold">{topics.length}</p>
        </div>
      </div>

      {loading ? (
        <div className="card">Loading learning logs...</div>
      ) : logs.length === 0 ? (
        <div className="card text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-neutral-600 mb-4" />
          <p className="text-neutral-300">No learning logs yet</p>
          <p className="text-xs text-muted mt-2">Add your first lesson and start your growth record.</p>
        </div>
      ) : (
        <div className="card">
          <h2 className="subsection-title mb-4">All Lessons</h2>
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 rounded-lg border border-neutral-700/50 p-4">
                <input type="checkbox" checked={log.completed} onChange={() => toggleCompleted(log)} className="mt-2" />
                <div className="flex-1">
                  <h4 className="font-semibold text-neutral-200">{log.lessonTitle}</h4>
                  <p className="text-sm text-muted mt-1">
                    {log.topic} • {log.source || "local notes"} • {formatDate(new Date(log.date))}
                  </p>
                  {log.keyTakeaways && <p className="text-sm text-neutral-400 mt-2">{log.keyTakeaways}</p>}
                </div>
                <div className="text-right">
                  <p className="text-xs badge badge-success">{log.proficiencyLevel}%</p>
                  <p className="text-xs text-muted mt-1">{log.duration || 0}min</p>
                  <button onClick={() => deleteLog(log.id)} className="mt-2 text-neutral-500 hover:text-red-400">
                    <Trash2 className="h-4 w-4 inline" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
