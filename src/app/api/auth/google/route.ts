import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { COOKIE_OAUTH_STATE } from "@/lib/auth";

// Nunca cachear: siempre lee/escribe datos en vivo contra la base.
export const dynamic = "force-dynamic";

function nextSeguro(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/";
  return next;
}

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: "Falta configurar GOOGLE_CLIENT_ID" }, { status: 500 });
  }

  const { searchParams, origin } = new URL(req.url);
  const next = nextSeguro(searchParams.get("next"));
  const state = crypto.randomBytes(16).toString("hex");
  const redirectUri = `${origin}/api/auth/google/callback`;

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("prompt", "select_account");

  const res = NextResponse.redirect(url.toString());
  // Cookie de corta duración: solo sirve para validar el callback (protección CSRF).
  res.cookies.set(COOKIE_OAUTH_STATE, JSON.stringify({ state, next }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  });
  return res;
}
