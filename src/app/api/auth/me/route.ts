import { NextRequest, NextResponse } from "next/server";
import { obtenerSesionClienteDesdeRequest } from "@/lib/auth";
import { obtenerVouchersDisponibles } from "@/lib/db";
import { prisma } from "@/lib/prisma";

// Nunca cachear: siempre lee/escribe datos en vivo contra la base.
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sesion = await obtenerSesionClienteDesdeRequest(req);
  if (!sesion) return NextResponse.json({ usuario: null });

  const [usuario, vouchers] = await Promise.all([
    prisma.usuario.findUnique({ where: { id: sesion.usuarioId }, select: { telefono: true } }),
    obtenerVouchersDisponibles(sesion.usuarioId),
  ]);

  return NextResponse.json({
    usuario: { ...sesion, telefono: usuario?.telefono ?? null, vouchers },
  });
}
