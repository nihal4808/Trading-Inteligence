import { prisma } from "@/lib/db/prisma";

function percent(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

export async function getDashboardAnalytics() {
  const [tasks, trades, diaryEntries, learningLogs, media] = await Promise.all([
    prisma.dailyTask.findMany({ orderBy: { date: "desc" } }),
    prisma.trade.findMany({ orderBy: { date: "desc" } }),
    prisma.diaryEntry.findMany({ orderBy: { date: "desc" } }),
    prisma.learningLog.findMany({ orderBy: { date: "desc" } }),
    prisma.mediaItem.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  const completedTasks = tasks.filter((t) => t.completed).length;
  const wins = trades.filter((t) => (t.profitLoss ?? 0) > 0).length;
  const totalPnL = trades.reduce((sum, t) => sum + (t.profitLoss ?? 0), 0);
  const averageMood = diaryEntries.length
    ? Math.round(diaryEntries.reduce((sum, d) => sum + d.mood, 0) / diaryEntries.length)
    : 0;
  const watchedMedia = media.filter((m) => String(m.status).toLowerCase() === "watched").length;

  const emotionalTrend = diaryEntries
    .slice(0, 7)
    .reverse()
    .map((entry) => ({
      day: entry.date.toLocaleDateString("en-US", { weekday: "short" }),
      mood: entry.mood,
      confidence: entry.confidence,
      stress: entry.stress,
    }));

  const mediaImpact = media
    .filter((m) => m.rating)
    .slice(0, 6)
    .map((m) => ({
      title: m.title,
      insight: m.rating ?? 0,
    }));

  return {
    summary: {
      completionRate: percent(completedTasks, tasks.length),
      winRate: percent(wins, trades.length),
      totalPnL,
      averageMood,
      watchedMedia,
      totalMedia: media.length,
      totalTrades: trades.length,
      totalLearningLogs: learningLogs.length,
    },
    emotionalTrend,
    mediaImpact,
  };
}
