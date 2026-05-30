"use client";

import React from "react";
import { Menu } from "lucide-react";

export default function TopNav({
  onMenuClick,
}: {
  onMenuClick: () => void;
}) {
  return (
    <header className="border-b border-neutral-700 bg-neutral-900 px-6 py-4">
      <div className="flex items-center justify-between">
        <button
          onClick={onMenuClick}
          className="inline-flex rounded-lg p-2 hover:bg-neutral-800 md:hidden"
        >
          <Menu className="h-6 w-6 text-neutral-400" />
        </button>
        <h1 className="text-lg font-semibold text-white">
          Trading Intelligence System
        </h1>
        <div className="w-10" />
      </div>
    </header>
  );
}
