import { NextResponse } from "next/server";
import { COOKIE_CLIENTE } from "@/lib/auth";

// Nunca cachear: siempre lee/escribe datos en vivo contra la base.
export const dynamic = "force-dynamic";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(COOKIE_CLIENTE);
  return res;
}
