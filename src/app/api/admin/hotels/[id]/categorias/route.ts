import { NextRequest, NextResponse } from "next/server";
import { generarId, mutateDB } from "@/lib/store";
import { obtenerSesionDesdeRequest } from "@/lib/auth";
import { Categoria, Habitacion, TurnoHoras } from "@/lib/types";

interface CrearCategoriaBody {
  nombre?: string;
  descripcion?: string;
  totalHabitaciones?: number;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const sesion = await obtenerSesionDesdeRequest(req);
  if (!sesion || sesion.hotelId !== id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as CrearCategoriaBody;
  const nombre = body.nombre?.trim();
  if (!nombre) {
    return NextResponse.json({ error: "Ponele un nombre a la categoría" }, { status: 400 });
  }
  const cantidad =
    typeof body.totalHabitaciones === "number" && body.totalHabitaciones >= 0
      ? Math.floor(body.totalHabitaciones)
      : 1;

  try {
    const categoria = await mutateDB((db) => {
      const hotel = db.hotels.find((h) => h.id === id);
      if (!hotel) throw new Error("Hotel no encontrado");

      const habitaciones: Habitacion[] = Array.from({ length: cantidad }, (_, i) => ({
        id: generarId("hab"),
        numero: String(i + 1),
        disponible: true,
      }));

      // Los turnos arrancan sin precio y desactivados: así no queda una
      // habitación "reservable" gratis hasta que el hotel cargue precios
      // reales y la ofrezca a propósito (igual que al editar una existente).
      const nueva: Categoria = {
        id: generarId("cat"),
        nombre,
        descripcion: body.descripcion?.trim() ?? "",
        amenities: [],
        foto: null,
        habitaciones,
        totalHabitaciones: cantidad,
        disponibles: cantidad,
        turnos: [1, 3, 5].map((horas) => ({
          horas: horas as TurnoHoras,
          precio: 0,
          activo: false,
        })),
      };
      hotel.categorias.push(nueva);
      return nueva;
    });

    return NextResponse.json({ categoria }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 400 }
    );
  }
}
