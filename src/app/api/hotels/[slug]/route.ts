import { NextRequest, NextResponse } from "next/server";
import { obtenerHotelConDisponibilidadPorSlug } from "@/lib/db";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const hotel = await obtenerHotelConDisponibilidadPorSlug(slug);
    if (!hotel) {
      return NextResponse.json({ error: "Hotel no encontrado" }, { status: 404 });
    }
    const comentarios = await prisma.comentario.findMany({
      where: { hotelId: hotel.id },
      orderBy: { creada: "desc" },
    });

    return NextResponse.json({ hotel, comentarios });
  } catch (e) {
    console.error("GET /api/hotels/[slug]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error interno" },
      { status: 500 }
    );
  }
}
