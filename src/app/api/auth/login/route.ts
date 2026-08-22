import { NextRequest, NextResponse } from "next/server";
import { COOKIE_SESION, crearTokenSesion, verificarPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface LoginBody {
  email?: string;
  password?: string;
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as LoginBody;
  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";

  if (!email || !password) {
    return NextResponse.json({ error: "Ingresá tu email y contraseña" }, { status: 400 });
  }

  const cuenta = await prisma.cuentaHotel.findUnique({ where: { email } });
  if (!cuenta || !(await verificarPassword(password, cuenta.passwordHash))) {
    return NextResponse.json({ error: "Email o contraseña incorrectos" }, { status: 401 });
  }

  try {
    const token = await crearTokenSesion({ hotelId: cuenta.hotelId, email: cuenta.email });
    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE_SESION, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error interno" },
      { status: 500 }
    );
  }
}
