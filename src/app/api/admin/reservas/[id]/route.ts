import { NextRequest, NextResponse } from "next/server";
import { mutateDB } from "@/lib/store";
import { ReservaEstado } from "@/lib/types";

interface PatchReservaBody {
  estado?: ReservaEstado;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as PatchReservaBody;

  if (body.estado !== "finalizada" && body.estado !== "cancelada") {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
  }

  try {
    const reserva = await mutateDB((db) => {
      const r = db.reservas.find((x) => x.id === id);
      if (!r) throw new Error("Reserva no encontrada");

      if (r.estado === "activa") {
        const hotel = db.hotels.find((h) => h.id === r.hotelId);
        const categoria = hotel?.categorias.find((c) => c.id === r.categoriaId);
        if (categoria) {
          categoria.disponibles = Math.min(categoria.totalHabitaciones, categoria.disponibles + 1);
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
