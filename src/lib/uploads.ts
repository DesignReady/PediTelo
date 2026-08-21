import fs from "fs";
import path from "path";
import { isNetlifyRuntime } from "./env";

const USE_BLOBS = isNetlifyRuntime;

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
const BLOB_STORE_NAME = "peditelo-uploads";

let blobStorePromise: ReturnType<typeof importBlobStore> | null = null;
async function importBlobStore() {
  const { getStore } = await import("@netlify/blobs");
  return getStore(BLOB_STORE_NAME, { consistency: "strong" });
}
function getBlobStore() {
  if (!blobStorePromise) blobStorePromise = importBlobStore();
  return blobStorePromise;
}

export async function guardarImagen(filename: string, buffer: Buffer): Promise<void> {
  if (USE_BLOBS) {
    const store = await getBlobStore();
    const arrayBuffer = buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength
    ) as ArrayBuffer;
    await store.set(filename, arrayBuffer);
    return;
  }
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  fs.writeFileSync(path.join(UPLOADS_DIR, filename), buffer);
}

export async function leerImagen(filename: string): Promise<Buffer | null> {
  if (USE_BLOBS) {
    const store = await getBlobStore();
    const data = await store.get(filename, { type: "arrayBuffer" });
    return data ? Buffer.from(data) : null;
  }
  const filePath = path.join(UPLOADS_DIR, filename);
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath);
}

export async function borrarImagen(filename: string): Promise<void> {
  if (USE_BLOBS) {
    const store = await getBlobStore();
    await store.delete(filename).catch(() => undefined);
    return;
  }
  fs.rm(path.join(UPLOADS_DIR, filename), { force: true }, () => undefined);
}

/** URL pública (servida por nuestra propia API) para una imagen subida. */
export function urlImagen(filename: string): string {
  return `/api/uploads/${filename}`;
}
