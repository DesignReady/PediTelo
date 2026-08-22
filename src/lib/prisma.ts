import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

// En dev, el hot-reload de Next.js volvería a crear un PrismaClient (y una
// conexión nueva) en cada recarga si no lo cacheamos en `global`.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function crearClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL no está configurada");
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? crearClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
