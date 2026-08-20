import { NextRequest, NextResponse } from "next/server";
import { readDBSincronizada } from "@/lib/store";
import { hotelConDisponibilidad } from "@/lib/availability";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const db = await readDBSincronizada();
  const hotel = db.hotels.find((h) => h.slug === slug);
  if (!hotel) {
    return NextResponse.json({ error: "Hotel no encontrado" }, { status: 404 });
  }
  const comentarios = db.comentarios
    .filter((c) => c.hotelId === hotel.id)
    .sort((a, b) => new Date(b.creada).getTime() - new Date(a.creada).getTime());

  return NextResponse.json({ hotel: hotelConDisponibilidad(db, hotel), comentarios });
}
