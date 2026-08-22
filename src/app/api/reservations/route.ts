import { NextRequest, NextResponse } from "next/server";
import { crearReserva } from "@/lib/db";

// Nunca cachear: siempre lee/escribe datos en vivo contra la base.
export const dynamic = "force-dynamic";

interface CrearReservaBody {
  hotelSlug?: string;
  categoriaId?: string;
  turnoHoras?: number;
  clienteNombre?: string;
  clienteTelefono?: string;
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as CrearReservaBody;
  const { hotelSlug, categoriaId, turnoHoras, clienteNombre, clienteTelefono } = body;

  if (!hotelSlug || !categoriaId || !turnoHoras || !clienteNombre?.trim() || !clienteTelefono?.trim()) {
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
      clienteNombre: clienteNombre.trim(),
      clienteTelefono: clienteTelefono.trim(),
    });

    return NextResponse.json(resultado, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "No se pudo completar la reserva";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
