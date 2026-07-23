import { PrismaClient } from "@prisma/client";
import { resolved } from "@/lib/env";

/**
 * Prisma singleton (survives dev hot-reload). The app runs without a
 * database in mock mode — features that need persistence check
 * `resolved.hasDatabase` and degrade gracefully.
 */

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma: PrismaClient | null = resolved.hasDatabase
  ? (globalForPrisma.prisma ?? new PrismaClient())
  : null;

if (prisma && process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/** Use in code paths that require the database; throws a clear error otherwise. */
export function requireDb(): PrismaClient {
  if (!prisma) {
    throw new Error(
      "This feature requires a database. Set DATABASE_URL in .env — see docs/SETUP.md.",
    );
  }
  return prisma;
}
