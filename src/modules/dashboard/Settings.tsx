"use client";

import React, { useEffect, useState } from "react";
import { Download, Upload, Database, Settings as SettingsIcon } from "lucide-react";

type SystemStatus = {
  app: {
    name: string;
    version: string;
    framework: string;
    orm: string;
  };
  paths: {
    root: string;
    databasePath: string;
    backupsPath: string;
    exportsPath: string;
  };
  storage: {
    databaseSizeBytes: number;
    totalRecords: number;
    breakdown: Record<string, number>;
  };
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(2)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

export default function SettingsPage() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      const res = await fetch("/api/system/status", { cache: "no-store" });
      const json = await res.json();
      if (active && res.ok && json.ok) {
        setStatus(json.data as SystemStatus);
      }
      if (active) setLoading(false);
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  const showPlaceholder = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 3000);
  };

  if (loading) return <div className="card">Loading settings...</div>;
  if (!status) return <div className="card text-red-400">Failed to load system status.</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="section-title">Settings</h1>
        <p className="text-muted mt-1">Local system configuration and storage details</p>
      </div>

      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="rounded-lg bg-green-900/30 p-3">
            <Download className="h-6 w-6 text-green-400" />
          </div>
          <div>
            <h2 className="subsection-title">Backups</h2>
            <p className="text-xs text-muted mt-1">Persistent local backup directory</p>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-neutral-300">Backup path: <span className="text-neutral-400">{status.paths.backupsPath}</span></p>
          <button className="btn btn-primary gap-2" onClick={() => showPlaceholder("Backup export placeholder triggered")}> 
            <Download className="h-4 w-4" />
            Create Backup (Placeholder)
          </button>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="rounded-lg bg-blue-900/30 p-3">
            <Upload className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <h2 className="subsection-title">Export & Import</h2>
            <p className="text-xs text-muted mt-1">Prepared placeholders for offline workflows</p>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-neutral-700 p-4">
            <p className="text-sm font-medium text-neutral-200">Export</p>
            <p className="text-xs text-muted mt-1 mb-3">Export path: {status.paths.exportsPath}</p>
            <button className="btn btn-secondary w-full" onClick={() => showPlaceholder("Export placeholder triggered")}>Export (Placeholder)</button>
          </div>
          <div className="rounded-lg border border-neutral-700 p-4">
            <p className="text-sm font-medium text-neutral-200">Import</p>
            <p className="text-xs text-muted mt-1 mb-3">Import backup files into local SQLite</p>
            <button className="btn btn-secondary w-full" onClick={() => showPlaceholder("Import placeholder triggered")}>Import (Placeholder)</button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="rounded-lg bg-purple-900/30 p-3">
            <Database className="h-6 w-6 text-purple-400" />
          </div>
          <h2 className="subsection-title">Database Information</h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg bg-neutral-800/50 p-4">
            <p className="text-xs text-muted uppercase font-semibold">Database Path</p>
            <p className="text-sm text-neutral-300 mt-2 break-all">{status.paths.databasePath}</p>
          </div>
          <div className="rounded-lg bg-neutral-800/50 p-4">
            <p className="text-xs text-muted uppercase font-semibold">Database Size</p>
            <p className="text-lg font-semibold text-neutral-200 mt-2">{formatBytes(status.storage.databaseSizeBytes)}</p>
          </div>
          <div className="rounded-lg bg-neutral-800/50 p-4">
            <p className="text-xs text-muted uppercase font-semibold">Total Records</p>
            <p className="text-lg font-semibold text-neutral-200 mt-2">{status.storage.totalRecords}</p>
          </div>
          <div className="rounded-lg bg-neutral-800/50 p-4">
            <p className="text-xs text-muted uppercase font-semibold">Breakdown</p>
            <div className="mt-2 text-sm text-neutral-300 space-y-1">
              {Object.entries(status.storage.breakdown).map(([key, value]) => (
                <p key={key}>{key}: {value}</p>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="rounded-lg bg-orange-900/30 p-3">
            <SettingsIcon className="h-6 w-6 text-orange-400" />
          </div>
          <h2 className="subsection-title">Application Info</h2>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between border-b border-neutral-700 py-2"><span className="text-neutral-400">Application</span><span className="text-neutral-200">{status.app.name}</span></div>
          <div className="flex justify-between border-b border-neutral-700 py-2"><span className="text-neutral-400">Version</span><span className="text-neutral-200">{status.app.version}</span></div>
          <div className="flex justify-between border-b border-neutral-700 py-2"><span className="text-neutral-400">Framework</span><span className="text-neutral-200">{status.app.framework}</span></div>
          <div className="flex justify-between py-2"><span className="text-neutral-400">ORM</span><span className="text-neutral-200">{status.app.orm}</span></div>
        </div>
      </div>

      {message && <div className="card border-blue-900/50 bg-blue-900/10 text-blue-300">{message}</div>}
    </div>
  );
}
