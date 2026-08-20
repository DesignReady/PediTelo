import fs from "fs";
import path from "path";
import { DB, Reserva } from "./types";
import { seedDB, seedHotels } from "./seed";
import { isNetlifyRuntime } from "./env";

// En Netlify las funciones corren en un filesystem de solo lectura (no persiste
// entre invocaciones), así que ahí usamos Netlify Blobs. En cualquier otro lado
// (desarrollo local o Render con disco persistente) usamos un archivo JSON normal.
const USE_BLOBS = isNetlifyRuntime;

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "db.json");
const BLOB_STORE_NAME = "peditelo-db";
const BLOB_KEY = "db.json";

let blobStorePromise: ReturnType<typeof importBlobStore> | null = null;
async function importBlobStore() {
  const { getStore } = await import("@netlify/blobs");
  return getStore(BLOB_STORE_NAME);
}
function getBlobStore() {
  if (!blobStorePromise) blobStorePromise = importBlobStore();
  return blobStorePromise;
}

// Rellena campos que se agregaron después de que ya había datos guardados
// (por ejemplo en Netlify Blobs, donde el seed solo corre una vez, la primera
// vez que la base está vacía). Sin esto, los hoteles ya persistidos se quedan
// para siempre sin los campos nuevos aunque el código se actualice.
function normalizar(db: DB): DB {
  if (!db.comentarios) db.comentarios = [];

  const faltaAlgo = db.hotels.some(
    (h) => h.descripcion === undefined || h.reglas === undefined
  );
  if (faltaAlgo) {
    const porSlug = new Map(seedHotels().map((h) => [h.slug, h]));
    for (const h of db.hotels) {
      const base = porSlug.get(h.slug);
      if (h.descripcion === undefined) h.descripcion = base?.descripcion ?? "";
      if (h.reglas === undefined) h.reglas = base?.reglas ?? [];
    }
  }

  return db;
}

async function ensureDB(): Promise<DB> {
  if (USE_BLOBS) {
    const store = await getBlobStore();
    const existente = await store.get(BLOB_KEY, { type: "json" });
    if (!existente) {
      const fresh = seedDB();
      await store.setJSON(BLOB_KEY, fresh);
      return fresh;
    }
    return normalizar(existente as DB);
  }

  if (!fs.existsSync(DB_PATH)) {
    const fresh = seedDB();
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(fresh, null, 2), "utf-8");
    return fresh;
  }
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  return normalizar(JSON.parse(raw) as DB);
}

async function saveDB(db: DB): Promise<void> {
  if (USE_BLOBS) {
    const store = await getBlobStore();
    await store.setJSON(BLOB_KEY, db);
    return;
  }
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

let writeQueue: Promise<unknown> = Promise.resolve();

export async function readDB(): Promise<DB> {
  return ensureDB();
}

export async function mutateDB<T>(fn: (db: DB) => T): Promise<T> {
  const run = writeQueue.then(async () => {
    const db = await ensureDB();
    const result = fn(db);
    await saveDB(db);
    return result;
  });
  writeQueue = run.catch(() => undefined);
  return run;
}

/** Descarta todo lo persistido y vuelve a sembrar desde cero. */
export async function resetDB(): Promise<DB> {
  const run = writeQueue.then(async () => {
    const fresh = seedDB();
    await saveDB(fresh);
    return fresh;
  });
  writeQueue = run.catch(() => undefined);
  return run;
}

/**
 * Marca como finalizadas las reservas cuyo turno ya venció y libera
 * automáticamente esa habitación en la categoría correspondiente.
 */
export function liberarReservasVencidas(db: DB, at: Date = new Date()): void {
  for (const r of db.reservas) {
    if (r.estado === "activa" && new Date(r.fin) <= at) {
      r.estado = "finalizada";
      const hotel = db.hotels.find((h) => h.id === r.hotelId);
      const categoria = hotel?.categorias.find((c) => c.id === r.categoriaId);
      if (categoria) {
        categoria.disponibles = Math.min(categoria.totalHabitaciones, categoria.disponibles + 1);
      }
    }
  }
}

/** Lee la base sincronizando primero las reservas vencidas (persistiendo la liberación). */
export async function readDBSincronizada(): Promise<DB> {
  return mutateDB((db) => {
    liberarReservasVencidas(db);
    return db;
  });
}

export function reservasActivasDe(
  db: DB,
  hotelId: string,
  categoriaId: string,
  at: Date = new Date()
): Reserva[] {
  return db.reservas.filter(
    (r) =>
      r.hotelId === hotelId &&
      r.categoriaId === categoriaId &&
      r.estado === "activa" &&
      new Date(r.fin) > at
  );
}

export function ocupadasDe(
  db: DB,
  hotelId: string,
  categoriaId: string,
  at: Date = new Date()
): number {
  return reservasActivasDe(db, hotelId, categoriaId, at).length;
}

export function generarCodigo(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) {
    s += chars[Math.floor(Math.random() * chars.length)];
  }
  return `PT-${s}`;
}

export function generarId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
