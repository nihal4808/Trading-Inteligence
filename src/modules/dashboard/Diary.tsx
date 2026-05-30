"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Bookmark, Plus, Search, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils/formatting";

type DiaryEntry = {
  id: string;
  date: string;
  title?: string | null;
  content?: string | null;
  tags?: string | null;
  mood: number;
  confidence: number;
  stress: number;
  emotionalNotes?: string | null;
};

async function getEntries(search?: string, tag?: string) {
  const query = new URLSearchParams();
  if (search) query.set("search", search);
  if (tag) query.set("tag", tag);
  const res = await fetch(`/api/diary?${query.toString()}`, { cache: "no-store" });
  const json = await res.json();
  if (!res.ok || !json.ok) throw new Error(json.error || "Failed to load diary entries");
  return json.data as DiaryEntry[];
}

export default function DiaryPage() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [form, setForm] = useState({
    title: "",
    content: "",
    tags: "",
    mood: 5,
    confidence: 5,
    stress: 5,
    emotionalNotes: "",
  });

  const load = useCallback(async (nextSearch = search, nextTag = tagFilter) => {
    setLoading(true);
    try {
      setEntries(await getEntries(nextSearch, nextTag));
    } finally {
      setLoading(false);
    }
  }, [search, tagFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const addOrUpdateEntry = async () => {
    await fetch(editingId ? `/api/diary/${editingId}` : "/api/diary", {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setForm({
      title: "",
      content: "",
      tags: "",
      mood: 5,
      confidence: 5,
      stress: 5,
      emotionalNotes: "",
    });
    setEditingId(null);
    await load();
  };

  const editEntry = (entry: DiaryEntry) => {
    setEditingId(entry.id);
    setForm({
      title: entry.title || "",
      content: entry.content || "",
      tags: entry.tags || "",
      mood: entry.mood,
      confidence: entry.confidence,
      stress: entry.stress,
      emotionalNotes: entry.emotionalNotes || "",
    });
  };

  const deleteEntry = async (id: string) => {
    await fetch(`/api/diary/${id}`, { method: "DELETE" });
    await load();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="section-title">Diary & Reflections</h1>
        <p className="text-muted mt-1">Real local diary persistence with search and tags</p>
      </div>

      <div className="card space-y-3">
        <div className="grid gap-3 md:grid-cols-2">
          <input
            className="input-field"
            placeholder="Entry title"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
          />
          <input
            className="input-field"
            placeholder="Tags (comma separated)"
            value={form.tags}
            onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
          />
        </div>
        <textarea
          className="input-field"
          rows={4}
          placeholder="Write your reflection"
          value={form.content}
          onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
        />
        <textarea
          className="input-field"
          rows={2}
          placeholder="Emotional notes"
          value={form.emotionalNotes}
          onChange={(e) => setForm((prev) => ({ ...prev, emotionalNotes: e.target.value }))}
        />
        <div className="grid gap-3 md:grid-cols-3">
          <label className="text-sm text-neutral-300">
            Mood: {form.mood}
            <input type="range" min={1} max={10} className="w-full mt-2" value={form.mood} onChange={(e) => setForm((prev) => ({ ...prev, mood: Number(e.target.value) }))} />
          </label>
          <label className="text-sm text-neutral-300">
            Confidence: {form.confidence}
            <input type="range" min={1} max={10} className="w-full mt-2" value={form.confidence} onChange={(e) => setForm((prev) => ({ ...prev, confidence: Number(e.target.value) }))} />
          </label>
          <label className="text-sm text-neutral-300">
            Stress: {form.stress}
            <input type="range" min={1} max={10} className="w-full mt-2" value={form.stress} onChange={(e) => setForm((prev) => ({ ...prev, stress: Number(e.target.value) }))} />
          </label>
        </div>
        <button onClick={addOrUpdateEntry} className="btn btn-primary gap-2">
          <Plus className="h-4 w-4" />
          {editingId ? "Update Entry" : "Save Entry"}
        </button>
        {editingId && (
          <button
            onClick={() => {
              setEditingId(null);
              setForm({ title: "", content: "", tags: "", mood: 5, confidence: 5, stress: 5, emotionalNotes: "" });
            }}
            className="btn btn-secondary"
          >
            Cancel Edit
          </button>
        )}
      </div>

      <div className="card">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="relative md:col-span-2">
            <Search className="h-4 w-4 absolute left-3 top-3 text-neutral-500" />
            <input
              className="input-field pl-9"
              placeholder="Search diary entries"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <input
            className="input-field"
            placeholder="Filter by tag"
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
          />
          <button className="btn btn-secondary" onClick={() => load(search, tagFilter)}>
            Apply Filters
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card">Loading diary...</div>
      ) : entries.length === 0 ? (
        <div className="card text-center py-12">
          <Bookmark className="mx-auto h-12 w-12 text-neutral-600 mb-4" />
          <p className="text-neutral-300">Write your first diary reflection</p>
          <p className="text-xs text-muted mt-2">No fake entries are preloaded. Your journey starts now.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <div key={entry.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-neutral-200">{entry.title || formatDate(new Date(entry.date))}</h3>
                  <p className="text-xs text-muted mt-1">{formatDate(new Date(entry.date))}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => editEntry(entry)} className="text-neutral-500 hover:text-blue-400 text-xs">Edit</button>
                  <button onClick={() => deleteEntry(entry.id)} className="text-neutral-500 hover:text-red-400">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                <p className="text-blue-300">Mood: {entry.mood}/10</p>
                <p className="text-green-300">Confidence: {entry.confidence}/10</p>
                <p className="text-red-300">Stress: {entry.stress}/10</p>
              </div>

              {entry.content && (
                <div className="mt-3 rounded-lg bg-neutral-800/50 p-3 text-sm text-neutral-300">{entry.content}</div>
              )}

              {entry.emotionalNotes && (
                <div className="mt-3 rounded-lg border border-blue-900/30 bg-blue-900/10 p-3 text-sm text-blue-200">
                  {entry.emotionalNotes}
                </div>
              )}

              {entry.tags && <p className="text-xs text-muted mt-3">Tags: {entry.tags}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
