import { NextRequest, NextResponse } from "next/server";
import { mutateDB, readDBSincronizada } from "@/lib/store";
import { hotelConDisponibilidad } from "@/lib/availability";
import { obtenerSesionDesdeRequest } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const sesion = await obtenerSesionDesdeRequest(req);
  if (!sesion || sesion.hotelId !== id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const db = await readDBSincronizada();
    const hotel = db.hotels.find((h) => h.id === id);
    if (!hotel) {
      return NextResponse.json({ error: "Hotel no encontrado" }, { status: 404 });
    }
    const now = new Date();
    const conDisponibilidad = hotelConDisponibilidad(db, hotel, now);
    const reservas = db.reservas
      .filter((r) => r.hotelId === id && r.estado === "activa" && new Date(r.fin) > now)
      .sort((a, b) => new Date(a.fin).getTime() - new Date(b.fin).getTime());

    return NextResponse.json({ hotel: conDisponibilidad, reservas });
  } catch (e) {
    console.error("GET /api/admin/hotels/[id]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error interno" },
      { status: 500 }
    );
  }
}

interface PatchHotelBody {
  abierto?: boolean;
  descripcion?: string;
  reglas?: string[];
  amenitiesGenerales?: string[];
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const sesion = await obtenerSesionDesdeRequest(req);
  if (!sesion || sesion.hotelId !== id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as PatchHotelBody;

  try {
    const hotel = await mutateDB((db) => {
      const h = db.hotels.find((x) => x.id === id);
      if (!h) throw new Error("Hotel no encontrado");
      if (typeof body.abierto === "boolean") h.abierto = body.abierto;
      if (typeof body.descripcion === "string") h.descripcion = body.descripcion.trim();
      if (Array.isArray(body.reglas)) {
        h.reglas = body.reglas.map((r) => r.trim()).filter(Boolean);
      }
      if (Array.isArray(body.amenitiesGenerales)) {
        h.amenitiesGenerales = body.amenitiesGenerales.map((a) => a.trim()).filter(Boolean);
      }
      return h;
    });
    return NextResponse.json({ hotel });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 400 }
    );
  }
}
