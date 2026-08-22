import { PrismaClient } from "@prisma/client";

// En dev, el hot-reload de Next.js volvería a crear un PrismaClient (y una
// conexión nueva) en cada recarga si no lo cacheamos en `global`.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
