import { NextRequest, NextResponse } from "next/server";
import {
  COOKIE_SUPERADMIN,
  crearTokenSuperadmin,
  passwordMaestraConfigurada,
  passwordMaestraValida,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  if (!passwordMaestraConfigurada()) {
    return NextResponse.json(
      { error: "Falta configurar SUPERADMIN_PASSWORD en el servidor" },
      { status: 500 }
    );
  }

  const body = (await req.json().catch(() => ({}))) as { password?: string };
  if (!body.password || !passwordMaestraValida(body.password)) {
    return NextResponse.json({ error: "Clave incorrecta" }, { status: 401 });
  }

  try {
    const token = await crearTokenSuperadmin();
    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE_SUPERADMIN, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12,
    });
    return res;
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error interno" },
      { status: 500 }
    );
  }
}
