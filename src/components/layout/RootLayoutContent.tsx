"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";

export default function RootLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen flex-col">
      <TopNav onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && (
          <aside className="hidden w-64 border-r border-neutral-700 bg-neutral-900 md:block">
            <Sidebar />
          </aside>
        )}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
