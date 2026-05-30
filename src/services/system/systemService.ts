import fs from "fs";
import { prisma } from "@/lib/db/prisma";
import { ensureLocalEnvironment } from "./bootstrap";
import { getAppDataPaths, getDataRootPath } from "./paths";

function getAppVersion(): string {
  // Avoid importing package.json (json import settings vary); read from env if present.
  return process.env.npm_package_version || "0.0.0";
}

export async function getSystemStatus() {
  const bootstrap = await ensureLocalEnvironment();
  const rootPath = getDataRootPath();
  const paths = getAppDataPaths();

  const counts = await Promise.all([
    prisma.weeklyPlan.count(),
    prisma.dailyTask.count(),
    prisma.trade.count(),
    prisma.diaryEntry.count(),
    prisma.learningLog.count(),
    prisma.mediaItem.count(),
  ]);

  const dbSizeBytes = fs.existsSync(paths.databaseFile)
    ? fs.statSync(paths.databaseFile).size
    : 0;

  return {
    bootstrap,
    app: {
      name: "Trading Intelligence System",
      version: getAppVersion(),
      framework: "Next.js (Local)",
      orm: "Prisma",
    },
    paths: {
      root: rootPath,
      databasePath: paths.databaseFile,
      backupsPath: paths.backupsDir,
      exportsPath: paths.exportsDir,
    },
    storage: {
      databaseSizeBytes: dbSizeBytes,
      totalRecords:
        counts[0] + counts[1] + counts[2] + counts[3] + counts[4] + counts[5],
      breakdown: {
        weeklyPlans: counts[0],
        dailyTasks: counts[1],
        trades: counts[2],
        diaryEntries: counts[3],
        learningLogs: counts[4],
        mediaItems: counts[5],
      },
    },
  };
}
