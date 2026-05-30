import { PrismaClient } from "@prisma/client";

import fs from "fs";
import path from "path";

function ensureLocalStorageFolders() {
  // Keep this file dependency-free from app services to avoid circular imports.
  const root = process.cwd();
  const required = ["database", "screenshots", "backups", "exports", "media-reviews"];
  for (const folder of required) {
    fs.mkdirSync(path.join(root, folder), { recursive: true });
  }
}

ensureLocalStorageFolders();

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
