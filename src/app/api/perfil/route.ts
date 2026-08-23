import { NextRequest, NextResponse } from "next/server";
import { obtenerSesionClienteDesdeRequest } from "@/lib/auth";
import { obtenerPerfilCliente } from "@/lib/db";

// Nunca cachear: siempre lee/escribe datos en vivo contra la base.
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sesion = await obtenerSesionClienteDesdeRequest(req);
  if (!sesion) {
    return NextResponse.json({ error: "Iniciá sesión con Google" }, { status: 401 });
  }

  const perfil = await obtenerPerfilCliente(sesion.usuarioId);
  return NextResponse.json({ usuario: sesion, ...perfil });
}
