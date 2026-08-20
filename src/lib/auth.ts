import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import type { NextRequest } from "next/server";

const SESSION_SECRET = process.env.SESSION_SECRET || "";
const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD || "";

// Sin secreto configurado no se firma ni se valida ninguna sesión: preferimos
// que el login falle con un error claro antes que usar un valor por defecto
// que quedaría visible en el repo público.
const secretKey = () => {
  if (!SESSION_SECRET) {
    throw new Error("Falta configurar la variable de entorno SESSION_SECRET");
  }
  return new TextEncoder().encode(SESSION_SECRET);
};

export const COOKIE_SESION = "pt_sesion";
export const COOKIE_SUPERADMIN = "pt_superadmin";

export async function hashPassword(plano: string): Promise<string> {
  return bcrypt.hash(plano, 10);
}

export async function verificarPassword(plano: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plano, hash);
}

/** Contraseña legible para generar y entregarle al hotel (sin caracteres ambiguos). */
export function generarPasswordLegible(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let s = "";
  for (let i = 0; i < 10; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export interface SesionHotel {
  hotelId: string;
  email: string;
}

export async function crearTokenSesion(payload: SesionHotel): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secretKey());
}

export async function verificarTokenSesion(token: string): Promise<SesionHotel | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (typeof payload.hotelId !== "string" || typeof payload.email !== "string") return null;
    return { hotelId: payload.hotelId, email: payload.email };
  } catch {
    return null;
  }
}

export async function crearTokenSuperadmin(): Promise<string> {
  return new SignJWT({ ok: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(secretKey());
}

export async function verificarTokenSuperadmin(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return payload.ok === true;
  } catch {
    return false;
  }
}

export function passwordMaestraConfigurada(): boolean {
  return SUPERADMIN_PASSWORD.length > 0;
}

export function passwordMaestraValida(intentada: string): boolean {
  return passwordMaestraConfigurada() && intentada === SUPERADMIN_PASSWORD;
}

export async function obtenerSesionDesdeRequest(req: NextRequest): Promise<SesionHotel | null> {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  if (!token) return null;
  return verificarTokenSesion(token);
}

export async function esSuperadminDesdeRequest(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(COOKIE_SUPERADMIN)?.value;
  if (!token) return false;
  return verificarTokenSuperadmin(token);
}
