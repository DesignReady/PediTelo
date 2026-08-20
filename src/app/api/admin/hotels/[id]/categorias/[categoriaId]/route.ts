import { NextRequest, NextResponse } from "next/server";
import { mutateDB } from "@/lib/store";
import { obtenerSesionDesdeRequest } from "@/lib/auth";

interface PatchCategoriaBody {
  nombre?: string;
  descripcion?: string;
  amenities?: string[];
  totalHabitaciones?: number;
  disponibles?: number;
  turnos?: { horas: number; precio?: number; activo?: boolean }[];
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; categoriaId: string }> }
) {
  const { id, categoriaId } = await params;

  const sesion = await obtenerSesionDesdeRequest(req);
  if (!sesion || sesion.hotelId !== id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as PatchCategoriaBody;

  try {
    const categoria = await mutateDB((db) => {
      const hotel = db.hotels.find((h) => h.id === id);
      if (!hotel) throw new Error("Hotel no encontrado");
      const cat = hotel.categorias.find((c) => c.id === categoriaId);
      if (!cat) throw new Error("Categoría no encontrada");

      if (typeof body.nombre === "string" && body.nombre.trim()) {
        cat.nombre = body.nombre.trim();
      }

      if (typeof body.descripcion === "string") {
        cat.descripcion = body.descripcion.trim();
      }

      if (Array.isArray(body.amenities)) {
        cat.amenities = body.amenities.map((a) => a.trim()).filter(Boolean);
      }

      if (typeof body.totalHabitaciones === "number" && body.totalHabitaciones >= 0) {
        cat.totalHabitaciones = Math.floor(body.totalHabitaciones);
        if (cat.disponibles > cat.totalHabitaciones) {
          cat.disponibles = cat.totalHabitaciones;
        }
      }

      if (typeof body.disponibles === "number" && body.disponibles >= 0) {
        cat.disponibles = Math.min(cat.totalHabitaciones, Math.floor(body.disponibles));
      }

      if (Array.isArray(body.turnos)) {
        for (const t of body.turnos) {
          const existente = cat.turnos.find((x) => x.horas === t.horas);
          if (!existente) continue;
          if (typeof t.precio === "number" && t.precio >= 0) {
            existente.precio = Math.floor(t.precio);
          }
          if (typeof t.activo === "boolean") {
            existente.activo = t.activo;
          }
        }
      }

      return cat;
    });

    return NextResponse.json({ categoria });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 400 }
    );
  }
}
