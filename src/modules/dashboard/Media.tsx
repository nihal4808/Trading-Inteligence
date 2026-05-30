"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Clapperboard, Plus, Star, Trash2 } from "lucide-react";

type MediaItem = {
  id: string;
  title: string;
  category?: string | null;
  mediaType: "MOVIE" | "DOCUMENTARY" | "BOOK" | "PODCAST";
  status: "UNWATCHED" | "WATCHING" | "WATCHED";
  rating?: number | null;
  review?: string | null;
  lessonsLearned?: string | null;
  emotionalImpact?: string | null;
  watchedAt?: string | null;
};

async function getMedia() {
  const res = await fetch("/api/media", { cache: "no-store" });
  const json = await res.json();
  if (!res.ok || !json.ok) throw new Error(json.error || "Failed to load media");
  return json.data as MediaItem[];
}

export default function MediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<MediaItem["status"] | null>(null);
  const [form, setForm] = useState({
    title: "",
    category: "trading",
    mediaType: "MOVIE",
    status: "UNWATCHED",
    rating: "",
    review: "",
    lessonsLearned: "",
    emotionalImpact: "",
    watchedAt: "",
  });

  const load = async () => {
    setLoading(true);
    try {
      setItems(await getMedia());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () => (selectedStatus ? items.filter((item) => item.status === selectedStatus) : items),
    [items, selectedStatus]
  );

  const watched = items.filter((m) => m.status === "WATCHED").length;
  const watching = items.filter((m) => m.status === "WATCHING").length;
  const unwatched = items.filter((m) => m.status === "UNWATCHED").length;

  const createOrUpdateMedia = async () => {
    if (!form.title.trim()) return;
    await fetch(editingId ? `/api/media/${editingId}` : "/api/media", {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        category: form.category,
        mediaType: form.mediaType,
        status: form.status,
        rating: form.rating ? Number(form.rating) : undefined,
        review: form.review || undefined,
        lessonsLearned: form.lessonsLearned || undefined,
        emotionalImpact: form.emotionalImpact || undefined,
        watchedAt: form.watchedAt || undefined,
      }),
    });
    setEditingId(null);
    setForm({
      title: "",
      category: "trading",
      mediaType: "MOVIE",
      status: "UNWATCHED",
      rating: "",
      review: "",
      lessonsLearned: "",
      emotionalImpact: "",
      watchedAt: "",
    });
    await load();
  };

  const changeStatus = async (id: string, status: MediaItem["status"]) => {
    await fetch(`/api/media/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await load();
  };

  const removeItem = async (id: string) => {
    await fetch(`/api/media/${id}`, { method: "DELETE" });
    await load();
  };

  const editItem = (item: MediaItem) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      category: item.category || "trading",
      mediaType: item.mediaType,
      status: item.status,
      rating: item.rating ? String(item.rating) : "",
      review: item.review || "",
      lessonsLearned: item.lessonsLearned || "",
      emotionalImpact: item.emotionalImpact || "",
      watchedAt: item.watchedAt ? new Date(item.watchedAt).toISOString().slice(0, 10) : "",
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="section-title">Media Library</h1>
        <p className="text-muted mt-1">Movies, documentaries, books, podcasts with persistent reviews</p>
      </div>

      <div className="card">
        <div className="grid gap-3 md:grid-cols-3">
          <input
            className="input-field md:col-span-2"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
          />
          <select className="input-field" value={form.mediaType} onChange={(e) => setForm((prev) => ({ ...prev, mediaType: e.target.value }))}>
            <option value="MOVIE">movie</option>
            <option value="DOCUMENTARY">documentary</option>
            <option value="BOOK">book</option>
            <option value="PODCAST">podcast</option>
          </select>
          <select className="input-field" value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}>
            <option value="trading">trading</option>
            <option value="psychology">psychology</option>
            <option value="risk-management">risk-management</option>
            <option value="mindset">mindset</option>
          </select>
          <select className="input-field" value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}>
            <option value="UNWATCHED">unwatched</option>
            <option value="WATCHING">watching</option>
            <option value="WATCHED">watched</option>
          </select>
          <input className="input-field" type="number" min={1} max={10} placeholder="Rating (1-10)" value={form.rating} onChange={(e) => setForm((prev) => ({ ...prev, rating: e.target.value }))} />
          <textarea className="input-field md:col-span-3" rows={2} placeholder="Review" value={form.review} onChange={(e) => setForm((prev) => ({ ...prev, review: e.target.value }))} />
          <textarea className="input-field md:col-span-3" rows={2} placeholder="Lessons learned" value={form.lessonsLearned} onChange={(e) => setForm((prev) => ({ ...prev, lessonsLearned: e.target.value }))} />
          <textarea className="input-field md:col-span-2" rows={2} placeholder="Emotional impact" value={form.emotionalImpact} onChange={(e) => setForm((prev) => ({ ...prev, emotionalImpact: e.target.value }))} />
          <input className="input-field" type="date" value={form.watchedAt} onChange={(e) => setForm((prev) => ({ ...prev, watchedAt: e.target.value }))} />
          <button className="btn btn-primary md:col-span-3 gap-2" onClick={createOrUpdateMedia}>
            <Plus className="h-4 w-4" />
            {editingId ? "Update Media" : "Add Media"}
          </button>
          {editingId && (
            <button
              className="btn btn-secondary md:col-span-3"
              onClick={() => {
                setEditingId(null);
                setForm({
                  title: "",
                  category: "trading",
                    mediaType: "MOVIE",
                    status: "UNWATCHED",
                  rating: "",
                  review: "",
                  lessonsLearned: "",
                  emotionalImpact: "",
                    watchedAt: "",
                });
              }}
            >
              Cancel Edit
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <button onClick={() => setSelectedStatus("WATCHED")} className={`card-sm text-center transition-all ${selectedStatus === "WATCHED" ? "ring-2 ring-green-500" : ""}`}>
          <p className="text-2xl font-bold text-green-400">{watched}</p>
          <p className="text-xs text-muted mt-1">Watched</p>
        </button>
        <button onClick={() => setSelectedStatus("WATCHING")} className={`card-sm text-center transition-all ${selectedStatus === "WATCHING" ? "ring-2 ring-yellow-500" : ""}`}>
          <p className="text-2xl font-bold text-yellow-400">{watching}</p>
          <p className="text-xs text-muted mt-1">Watching</p>
        </button>
        <button onClick={() => setSelectedStatus("UNWATCHED")} className={`card-sm text-center transition-all ${selectedStatus === "UNWATCHED" ? "ring-2 ring-blue-500" : ""}`}>
          <p className="text-2xl font-bold text-blue-400">{unwatched}</p>
          <p className="text-xs text-muted mt-1">Unwatched</p>
        </button>
      </div>

      {loading ? (
        <div className="card">Loading media...</div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <Clapperboard className="mx-auto h-12 w-12 text-neutral-600 mb-4" />
          <p className="text-neutral-300">No media added yet</p>
          <p className="text-xs text-muted mt-2">Add your first movie, documentary, book, or podcast.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((media) => (
            <div key={media.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold text-neutral-200 text-lg">{media.title}</h3>
                <div className="flex gap-2">
                  <button onClick={() => editItem(media)} className="text-neutral-500 hover:text-blue-400 text-xs">Edit</button>
                  <button onClick={() => removeItem(media.id)} className="text-neutral-500 hover:text-red-400">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <span className="badge badge-info text-xs">{media.mediaType.toLowerCase()}</span>
                <span className="badge badge-warning text-xs">{media.status.toLowerCase()}</span>
                {media.category && <span className="badge badge-success text-xs capitalize">{media.category}</span>}
              </div>

              {media.rating ? (
                <div className="mt-3 flex items-center gap-1">
                  {[...Array(10)].map((_, i) => (
                    <Star key={i} className={`h-3 w-3 ${i < media.rating! ? "fill-yellow-400 text-yellow-400" : "text-neutral-700"}`} />
                  ))}
                </div>
              ) : null}

              {media.review && (
                <div className="mt-3 rounded-lg bg-neutral-800/50 p-3">
                  <p className="text-xs font-semibold text-neutral-400">Review</p>
                  <p className="text-sm text-neutral-300 mt-1">{media.review}</p>
                </div>
              )}

              {media.lessonsLearned && (
                <div className="mt-3 rounded-lg bg-blue-900/10 border border-blue-900/30 p-3">
                  <p className="text-xs font-semibold text-blue-400">Lessons Learned</p>
                  <p className="text-sm text-blue-200 mt-1">{media.lessonsLearned}</p>
                </div>
              )}

              <div className="mt-4 grid grid-cols-3 gap-2">
                <button onClick={() => changeStatus(media.id, "UNWATCHED")} className="btn btn-secondary text-xs">Unwatched</button>
                <button onClick={() => changeStatus(media.id, "WATCHING")} className="btn btn-secondary text-xs">Watching</button>
                <button onClick={() => changeStatus(media.id, "WATCHED")} className="btn btn-primary text-xs">Watched</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedStatus && (
        <div className="text-center">
          <button onClick={() => setSelectedStatus(null)} className="btn btn-secondary">
            Show All Media
          </button>
        </div>
      )}
    </div>
  );
}
