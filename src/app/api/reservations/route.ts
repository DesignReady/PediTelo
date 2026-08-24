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
  clienteNombre?: string;
  voucherId?: string;
  anonimo?: boolean;
}

export async function POST(req: NextRequest) {
  const sesion = await obtenerSesionClienteDesdeRequest(req);
  const body = (await req.json().catch(() => ({}))) as CrearReservaBody;
  const { hotelSlug, categoriaId, turnoHoras, clienteTelefono, clienteNombre, voucherId, anonimo } =
    body;

  // Sin sesión, solo se puede reservar pasando explícitamente por el flujo
  // anónimo (que igual pide nombre y teléfono a mano).
  if (!sesion && !anonimo) {
    return NextResponse.json(
      { error: "Iniciá sesión con Google para reservar, o elegí reservar de forma anónima" },
      { status: 401 }
    );
  }

  if (!hotelSlug || !categoriaId || !turnoHoras || !clienteTelefono?.trim()) {
    return NextResponse.json({ error: "Faltan datos para reservar" }, { status: 400 });
  }
  if (!sesion && !clienteNombre?.trim()) {
    return NextResponse.json({ error: "Falta tu nombre" }, { status: 400 });
  }
  if (![1, 3, 5].includes(turnoHoras)) {
    return NextResponse.json({ error: "Turno inválido" }, { status: 400 });
  }

  try {
    const resultado = await crearReserva({
      hotelSlug,
      categoriaId,
      turnoHoras,
      usuarioId: sesion?.usuarioId,
      clienteNombre: sesion ? sesion.nombre : clienteNombre!.trim(),
      clienteTelefono: clienteTelefono.trim(),
      voucherId: sesion ? voucherId?.trim() || undefined : undefined,
    });

    return NextResponse.json(resultado, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "No se pudo completar la reserva";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
