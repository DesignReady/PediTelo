import { NextRequest, NextResponse } from "next/server";
import { generarId, mutateDB } from "@/lib/store";
import { sincronizarConteo } from "@/lib/habitaciones";
import { obtenerSesionDesdeRequest } from "@/lib/auth";

interface PatchCategoriaBody {
  nombre?: string;
  descripcion?: string;
  amenities?: string[];
  habitaciones?: { id?: string; numero?: string; disponible?: boolean }[];
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

      if (Array.isArray(body.habitaciones)) {
        const existentesIds = new Set(cat.habitaciones.map((h) => h.id));
        const idsQueQuedan = new Set(
          body.habitaciones
            .map((h) => h.id)
            .filter((hid): hid is string => !!hid && existentesIds.has(hid))
        );
        const quitadas = cat.habitaciones.filter((h) => !idsQueQuedan.has(h.id));
        const quitaConReservaActiva = quitadas.some((h) =>
          db.reservas.some((r) => r.habitacionId === h.id && r.estado === "activa")
        );
        if (quitaConReservaActiva) {
          throw new Error("No se puede quitar una habitación con una reserva activa");
        }

        cat.habitaciones = body.habitaciones.map((h) => ({
          id: h.id && existentesIds.has(h.id) ? h.id : generarId("hab"),
          numero: h.numero?.trim() || "S/N",
          disponible: h.disponible !== false,
        }));
        sincronizarConteo(cat);
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; categoriaId: string }> }
) {
  const { id, categoriaId } = await params;

  const sesion = await obtenerSesionDesdeRequest(req);
  if (!sesion || sesion.hotelId !== id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    await mutateDB((db) => {
      const hotel = db.hotels.find((h) => h.id === id);
      if (!hotel) throw new Error("Hotel no encontrado");
      const cat = hotel.categorias.find((c) => c.id === categoriaId);
      if (!cat) throw new Error("Categoría no encontrada");

      const tieneReservasActivas = db.reservas.some(
        (r) => r.categoriaId === categoriaId && r.estado === "activa"
      );
      if (tieneReservasActivas) {
        throw new Error("No se puede eliminar: tiene reservas activas en este momento");
      }

      hotel.categorias = hotel.categorias.filter((c) => c.id !== categoriaId);
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 400 }
    );
  }
}
