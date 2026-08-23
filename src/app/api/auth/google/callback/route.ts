import { NextRequest, NextResponse } from "next/server";
import { COOKIE_CLIENTE, COOKIE_OAUTH_STATE, crearTokenCliente } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/site";

// Nunca cachear: siempre lee/escribe datos en vivo contra la base.
export const dynamic = "force-dynamic";

interface GoogleTokenResponse {
  access_token: string;
}

interface GoogleUserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  picture?: string;
}

export async function GET(req: NextRequest) {
  const origin = siteUrl();
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const errorParam = searchParams.get("error");

  const cookieRaw = req.cookies.get(COOKIE_OAUTH_STATE)?.value;
  let guardado: { state: string; next: string } | null = null;
  try {
    guardado = cookieRaw ? JSON.parse(cookieRaw) : null;
  } catch {
    guardado = null;
  }

  if (errorParam || !code || !state || !guardado || state !== guardado.state) {
    return NextResponse.redirect(`${origin}/?error=login`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "Falta configurar Google OAuth" }, { status: 500 });
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${origin}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });
    if (!tokenRes.ok) throw new Error("No se pudo validar con Google");
    const tokens = (await tokenRes.json()) as GoogleTokenResponse;

    const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    if (!userRes.ok) throw new Error("No se pudo obtener tu perfil de Google");
    const perfil = (await userRes.json()) as GoogleUserInfo;

    if (!perfil.email_verified) throw new Error("Email de Google no verificado");

    const usuario = await prisma.usuario.upsert({
      where: { googleId: perfil.sub },
      update: { email: perfil.email, nombre: perfil.name, fotoUrl: perfil.picture ?? null },
      create: {
        googleId: perfil.sub,
        email: perfil.email,
        nombre: perfil.name,
        fotoUrl: perfil.picture ?? null,
      },
    });

    const token = await crearTokenCliente({
      usuarioId: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
    });

    const res = NextResponse.redirect(`${origin}${guardado.next}`);
    res.cookies.set(COOKIE_CLIENTE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 90,
    });
    res.cookies.delete(COOKIE_OAUTH_STATE);
    return res;
  } catch (e) {
    console.error("GET /api/auth/google/callback", e);
    return NextResponse.redirect(`${origin}/?error=login`);
  }
}
