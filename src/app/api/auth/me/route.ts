import { NextRequest, NextResponse } from "next/server";
import { obtenerSesionClienteDesdeRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Nunca cachear: siempre lee/escribe datos en vivo contra la base.
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sesion = await obtenerSesionClienteDesdeRequest(req);
  if (!sesion) return NextResponse.json({ usuario: null });

  const usuario = await prisma.usuario.findUnique({
    where: { id: sesion.usuarioId },
    select: { telefono: true },
  });

  return NextResponse.json({
    usuario: { ...sesion, telefono: usuario?.telefono ?? null },
  });
}
