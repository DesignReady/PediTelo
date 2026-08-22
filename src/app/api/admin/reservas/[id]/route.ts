import { NextRequest, NextResponse } from "next/server";
import { actualizarEstadoReserva } from "@/lib/db";
import { ReservaEstado } from "@/lib/types";
import { obtenerSesionDesdeRequest } from "@/lib/auth";

interface PatchReservaBody {
  estado?: ReservaEstado;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const sesion = await obtenerSesionDesdeRequest(req);
  if (!sesion) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as PatchReservaBody;

  if (body.estado !== "finalizada" && body.estado !== "cancelada") {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
  }

  try {
    const reserva = await actualizarEstadoReserva(id, sesion.hotelId, body.estado);
    return NextResponse.json({ reserva });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 400 }
    );
  }
}
