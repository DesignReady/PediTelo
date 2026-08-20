import { NextRequest, NextResponse } from "next/server";
import { generarCodigo, generarId, liberarReservasVencidas, mutateDB } from "@/lib/store";
import { Reserva, TurnoHoras } from "@/lib/types";

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
    const resultado = await mutateDB((db) => {
      liberarReservasVencidas(db);

      const hotel = db.hotels.find((h) => h.slug === hotelSlug);
      if (!hotel) throw new Error("Hotel no encontrado");
      if (!hotel.abierto) throw new Error("Este alojamiento no está operando en este momento");

      const categoria = hotel.categorias.find((c) => c.id === categoriaId);
      if (!categoria) throw new Error("Categoría no encontrada");

      const turno = categoria.turnos.find((t) => t.horas === turnoHoras && t.activo);
      if (!turno) throw new Error("Ese turno no está disponible para esta categoría");

      if (categoria.disponibles <= 0) {
        throw new Error("Justo se acaba de ocupar la última habitación disponible");
      }

      const now = new Date();
      const fin = new Date(now.getTime() + turnoHoras * 60 * 60 * 1000);
      const nueva: Reserva = {
        id: generarId("res"),
        codigo: generarCodigo(),
        hotelId: hotel.id,
        categoriaId: categoria.id,
        turnoHoras: turnoHoras as TurnoHoras,
        precio: turno.precio,
        clienteNombre: clienteNombre.trim(),
        clienteTelefono: clienteTelefono.trim(),
        inicio: now.toISOString(),
        fin: fin.toISOString(),
        estado: "activa",
        creada: now.toISOString(),
      };
      db.reservas.push(nueva);
      categoria.disponibles -= 1;

      return {
        reserva: nueva,
        hotelNombre: hotel.nombre,
        categoriaNombre: categoria.nombre,
        direccion: hotel.direccion,
        zona: hotel.zona,
        telefono: hotel.telefono,
      };
    });

    return NextResponse.json(resultado, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "No se pudo completar la reserva";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
