import fs from "fs";
import path from "path";
import { prisma } from "@/lib/db/prisma";
import { getAppDataPaths, getDataRootPath } from "./paths";

const REQUIRED_FOLDERS = [
  "database",
  "screenshots",
  "backups",
  "exports",
  "media-reviews",
];

export type BootstrapStatus = {
  ok: boolean;
  rootPath: string;
  databasePath: string;
  ensuredFolders: string[];
  error?: string;
};

export async function ensureLocalEnvironment(): Promise<BootstrapStatus> {
  const rootPath = getDataRootPath();
  const paths = getAppDataPaths();
  const ensuredFolders: string[] = [];

  try {
    for (const folder of REQUIRED_FOLDERS) {
      const folderPath = path.join(rootPath, folder);
      fs.mkdirSync(folderPath, { recursive: true });
      ensuredFolders.push(folderPath);
    }

    if (!fs.existsSync(paths.databaseFile)) {
      fs.mkdirSync(paths.databaseDir, { recursive: true });
      fs.closeSync(fs.openSync(paths.databaseFile, "w"));
    }

    await prisma.$queryRaw`SELECT 1`;

    return {
      ok: true,
      rootPath,
      databasePath: paths.databaseFile,
      ensuredFolders,
    };
  } catch (error) {
    return {
      ok: false,
      rootPath,
      databasePath: paths.databaseFile,
      ensuredFolders,
      error: error instanceof Error ? error.message : "Unknown bootstrap error",
    };
  }
}
