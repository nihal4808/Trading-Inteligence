import path from "path";

export type AppDataPaths = {
  root: string;
  databaseDir: string;
  databaseFile: string;
  screenshotsDir: string;
  backupsDir: string;
  exportsDir: string;
  mediaReviewsDir: string;
};

export function getDataRootPath(): string {
  // This project is a local Next.js app; writable data lives in the repo root.
  return process.cwd();
}

export function getAppDataPaths(): AppDataPaths {
  const root = getDataRootPath();

  return {
    root,
    databaseDir: path.join(root, "database"),
    databaseFile: path.join(root, "database", "trading_system.db"),
    screenshotsDir: path.join(root, "screenshots"),
    backupsDir: path.join(root, "backups"),
    exportsDir: path.join(root, "exports"),
    mediaReviewsDir: path.join(root, "media-reviews"),
  };
}
