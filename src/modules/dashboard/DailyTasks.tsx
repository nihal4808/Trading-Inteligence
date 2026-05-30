"use client";

import React, { useEffect, useMemo, useState } from "react";
import { CheckSquare2, Filter, Plus, Trash2 } from "lucide-react";

type Task = {
  id: string;
  date: string;
  title: string;
  description?: string | null;
  category: string;
  priority: string;
  completed: boolean;
};

async function getTasks(): Promise<Task[]> {
  const res = await fetch("/api/daily-tasks", { cache: "no-store" });
  const json = await res.json();
  if (!res.ok || !json.ok) throw new Error(json.error || "Failed to load tasks");
  return json.data;
}

export default function DailyTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    category: "trading",
    priority: "medium",
  });

  const load = async () => {
    setLoading(true);
    try {
      setTasks(await getTasks());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(tasks.map((task) => task.category))),
    [tasks]
  );

  const filteredTasks = useMemo(
    () =>
      selectedCategory
        ? tasks.filter((task) => task.category === selectedCategory)
        : tasks,
    [tasks, selectedCategory]
  );

  const completionRate = filteredTasks.length
    ? Math.round((filteredTasks.filter((task) => task.completed).length / filteredTasks.length) * 100)
    : 0;

  const createOrUpdateTask = async () => {
    if (!newTask.title.trim()) return;
    setSaving(true);
    try {
      if (editingTaskId) {
        await fetch(`/api/daily-tasks/${editingTaskId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newTask),
        });
      } else {
        await fetch("/api/daily-tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newTask),
        });
      }
      setNewTask({ title: "", description: "", category: "trading", priority: "medium" });
      setEditingTaskId(null);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const toggleTask = async (task: Task) => {
    await fetch(`/api/daily-tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !task.completed }),
    });
    await load();
  };

  const removeTask = async (id: string) => {
    await fetch(`/api/daily-tasks/${id}`, { method: "DELETE" });
    await load();
  };

  const editTask = (task: Task) => {
    setEditingTaskId(task.id);
    setNewTask({
      title: task.title,
      description: task.description || "",
      category: task.category,
      priority: task.priority,
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="section-title">Daily Tasks</h1>
        <p className="text-muted mt-1">Persistent local task tracking with full CRUD</p>
      </div>

      <div className="card">
        <div className="grid gap-3 md:grid-cols-4">
          <input
            className="input-field md:col-span-2"
            placeholder="Task title"
            value={newTask.title}
            onChange={(e) => setNewTask((prev) => ({ ...prev, title: e.target.value }))}
          />
          <select
            className="input-field"
            value={newTask.category}
            onChange={(e) => setNewTask((prev) => ({ ...prev, category: e.target.value }))}
          >
            <option value="trading">trading</option>
            <option value="learning">learning</option>
            <option value="psychology">psychology</option>
            <option value="health">health</option>
          </select>
          <select
            className="input-field"
            value={newTask.priority}
            onChange={(e) => setNewTask((prev) => ({ ...prev, priority: e.target.value }))}
          >
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
          </select>
          <textarea
            className="input-field md:col-span-3"
            rows={2}
            placeholder="Description (optional)"
            value={newTask.description}
            onChange={(e) => setNewTask((prev) => ({ ...prev, description: e.target.value }))}
          />
          <button onClick={createOrUpdateTask} disabled={saving} className="btn btn-primary gap-2">
            <Plus className="h-4 w-4" />
            {saving ? "Saving..." : editingTaskId ? "Update Task" : "Add Task"}
          </button>
          {editingTaskId && (
            <button
              onClick={() => {
                setEditingTaskId(null);
                setNewTask({ title: "", description: "", category: "trading", priority: "medium" });
              }}
              className="btn btn-secondary"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted">Completion</p>
            <p className="mt-2 text-4xl font-bold">{completionRate}%</p>
          </div>
          <div className="rounded-lg bg-blue-900/30 p-4">
            <CheckSquare2 className="h-8 w-8 text-blue-400" />
          </div>
        </div>
        <div className="mt-4 h-3 rounded-full bg-neutral-800">
          <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${completionRate}%` }} />
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="h-5 w-5 text-neutral-400" />
          <h2 className="subsection-title">Filter by Category</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              selectedCategory === null
                ? "bg-blue-600 text-white"
                : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
            }`}
          >
            All Tasks
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors capitalize ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white"
                  : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="card">Loading tasks...</div>
      ) : filteredTasks.length === 0 ? (
        <div className="card text-center py-12">
          <CheckSquare2 className="mx-auto h-12 w-12 text-neutral-600 mb-4" />
          <p className="text-neutral-300">No tasks added yet</p>
          <p className="text-xs text-muted mt-2">Start your journey by creating your first task.</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`card-sm border-l-4 ${
                task.completed
                  ? "border-l-green-600 opacity-70"
                  : task.priority === "high"
                  ? "border-l-red-600"
                  : task.priority === "medium"
                  ? "border-l-yellow-600"
                  : "border-l-blue-600"
              }`}
            >
              <div className="flex gap-3">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task)}
                  className="mt-1 rounded cursor-pointer accent-blue-600"
                />
                <div className="flex-1">
                  <h3 className={`font-semibold ${task.completed ? "line-through text-neutral-500" : "text-neutral-200"}`}>
                    {task.title}
                  </h3>
                  {task.description && <p className="text-xs text-muted mt-1">{task.description}</p>}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="badge badge-info text-xs capitalize">{task.category}</span>
                    <span className="badge badge-warning text-xs capitalize">{task.priority}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => editTask(task)} className="text-neutral-500 hover:text-blue-400 text-xs">
                    Edit
                  </button>
                  <button onClick={() => removeTask(task.id)} className="text-neutral-500 hover:text-red-400">
                  <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
