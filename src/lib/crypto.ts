import crypto from "crypto";

// El access token de Mercado Pago de cada hotel controla su cuenta de cobro:
// se guarda cifrado en la base (AES-256-GCM), nunca en texto plano.
function claveDesdeEnv(): Buffer {
  const hex = process.env.MP_TOKEN_ENCRYPTION_KEY;
  if (!hex) throw new Error("MP_TOKEN_ENCRYPTION_KEY no está configurada");
  const key = Buffer.from(hex, "hex");
  if (key.length !== 32) {
    throw new Error("MP_TOKEN_ENCRYPTION_KEY debe ser un hex de 32 bytes (64 caracteres)");
  }
  return key;
}

export function cifrar(texto: string): string {
  const key = claveDesdeEnv();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const cifrado = Buffer.concat([cipher.update(texto, "utf-8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, cifrado]).toString("base64");
}

export function descifrar(payload: string): string {
  const key = claveDesdeEnv();
  const buf = Buffer.from(payload, "base64");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const cifrado = buf.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(cifrado), decipher.final()]).toString("utf-8");
}
