import { NextRequest, NextResponse } from "next/server";
import { mutateDB } from "@/lib/store";
import { liberarHabitacion } from "@/lib/habitaciones";
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
    const reserva = await mutateDB((db) => {
      const r = db.reservas.find((x) => x.id === id);
      if (!r) throw new Error("Reserva no encontrada");
      if (r.hotelId !== sesion.hotelId) throw new Error("No autorizado");

      if (r.estado === "activa") {
        const hotel = db.hotels.find((h) => h.id === r.hotelId);
        const categoria = hotel?.categorias.find((c) => c.id === r.categoriaId);
        if (categoria) {
          liberarHabitacion(categoria, r.habitacionId);
        }
      }

      r.estado = body.estado as ReservaEstado;
      return r;
    });
    return NextResponse.json({ reserva });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 400 }
    );
  }
}
