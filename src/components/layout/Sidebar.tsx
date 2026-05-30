"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  Calendar,
  CheckSquare2,
  Clapperboard,
  LayoutDashboard,
  Settings,
  TrendingUp,
  Zap,
  Bookmark,
  Route,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Weekly Planner", href: "/weekly-planner", icon: Calendar },
  { name: "Daily Tasks", href: "/daily-tasks", icon: CheckSquare2 },
  { name: "Trades", href: "/trades", icon: TrendingUp },
  { name: "Diary", href: "/diary", icon: Bookmark },
  { name: "Learning", href: "/learning", icon: BookOpen },
  { name: "Roadmap", href: "/roadmap", icon: Route },
  { name: "Media Library", href: "/media", icon: Clapperboard },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-8">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-blue-600 p-2">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">TradeMind</h1>
            <p className="text-xs text-neutral-400">Growth Intelligence</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-neutral-700 p-4">
        <p className="text-xs text-neutral-500">Local Offline Trading System</p>
        <p className="text-xs text-neutral-600 mt-1">v1.0.0</p>
      </div>
    </div>
  );
}
