import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { obtenerSesionDesdeRequest } from "@/lib/auth";

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
    const hotel = await prisma.hotel.findUnique({ where: { id }, select: { id: true } });
    if (!hotel) throw new Error("Hotel no encontrado");

    // Los turnos arrancan sin precio y desactivados: así no queda una
    // habitación "reservable" gratis hasta que el hotel cargue precios
    // reales y la ofrezca a propósito (igual que al editar una existente).
    const categoria = await prisma.categoria.create({
      data: {
        hotelId: id,
        nombre,
        descripcion: body.descripcion?.trim() ?? "",
        habitaciones: {
          create: Array.from({ length: cantidad }, (_, i) => ({ numero: String(i + 1) })),
        },
        turnos: {
          create: [1, 3, 5].map((horas) => ({ horas, precio: 0, activo: false })),
        },
      },
      include: { habitaciones: true, turnos: true },
    });

    return NextResponse.json({ categoria }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 400 }
    );
  }
}
