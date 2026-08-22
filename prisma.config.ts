import "dotenv/config";
import { config as loadEnvLocal } from "dotenv";
import { defineConfig, env } from "prisma/config";

// Next.js usa .env.local por convención; el CLI de Prisma por defecto solo
// carga .env, así que lo cargamos a mano acá para los comandos `prisma migrate`,
// `prisma studio`, etc.
loadEnvLocal({ path: ".env.local", override: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Los comandos de migración necesitan la conexión directa (sin pooler).
    url: env("DIRECT_URL"),
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
