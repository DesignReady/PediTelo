import { NextRequest, NextResponse } from "next/server";
import { obtenerHotelConDisponibilidadPorId, reservasActivasDeHotel } from "@/lib/db";
import { prisma } from "@/lib/prisma";
import { obtenerSesionDesdeRequest } from "@/lib/auth";

// Nunca cachear: siempre lee/escribe datos en vivo contra la base.
export const dynamic = "force-dynamic";

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
    const hotel = await obtenerHotelConDisponibilidadPorId(id);
    if (!hotel) {
      return NextResponse.json({ error: "Hotel no encontrado" }, { status: 404 });
    }
    const reservas = await reservasActivasDeHotel(id);

    return NextResponse.json({ hotel, reservas });
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

  const data: {
    abierto?: boolean;
    descripcion?: string;
    reglas?: string[];
    amenitiesGenerales?: string[];
  } = {};
  if (typeof body.abierto === "boolean") data.abierto = body.abierto;
  if (typeof body.descripcion === "string") data.descripcion = body.descripcion.trim();
  if (Array.isArray(body.reglas)) {
    data.reglas = body.reglas.map((r) => r.trim()).filter(Boolean);
  }
  if (Array.isArray(body.amenitiesGenerales)) {
    data.amenitiesGenerales = body.amenitiesGenerales.map((a) => a.trim()).filter(Boolean);
  }

  try {
    // select explícito: nunca devolver mercadopagoAccessTokenCifrado ni la
    // public key en una respuesta JSON, aunque el front no los use hoy.
    const hotel = await prisma.hotel.update({
      where: { id },
      data,
      select: { id: true, abierto: true, descripcion: true, reglas: true, amenitiesGenerales: true },
    });
    return NextResponse.json({ hotel });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 400 }
    );
  }
}
