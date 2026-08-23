import { NextRequest, NextResponse } from "next/server";
import { crearReserva } from "@/lib/db";
import { obtenerSesionClienteDesdeRequest } from "@/lib/auth";

// Nunca cachear: siempre lee/escribe datos en vivo contra la base.
export const dynamic = "force-dynamic";

interface CrearReservaBody {
  hotelSlug?: string;
  categoriaId?: string;
  turnoHoras?: number;
  clienteTelefono?: string;
}

export async function POST(req: NextRequest) {
  const sesion = await obtenerSesionClienteDesdeRequest(req);
  if (!sesion) {
    return NextResponse.json(
      { error: "Iniciá sesión con Google para reservar" },
      { status: 401 }
    );
  }

  const body = (await req.json().catch(() => ({}))) as CrearReservaBody;
  const { hotelSlug, categoriaId, turnoHoras, clienteTelefono } = body;

  if (!hotelSlug || !categoriaId || !turnoHoras || !clienteTelefono?.trim()) {
    return NextResponse.json({ error: "Faltan datos para reservar" }, { status: 400 });
  }
  if (![1, 3, 5].includes(turnoHoras)) {
    return NextResponse.json({ error: "Turno inválido" }, { status: 400 });
  }

  try {
    const resultado = await crearReserva({
      hotelSlug,
      categoriaId,
      turnoHoras,
      usuarioId: sesion.usuarioId,
      clienteNombre: sesion.nombre,
      clienteTelefono: clienteTelefono.trim(),
    });

    return NextResponse.json(resultado, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "No se pudo completar la reserva";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
