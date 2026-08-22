import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Nunca cachear: siempre lee/escribe datos en vivo contra la base.
export const dynamic = "force-dynamic";

interface CrearComentarioBody {
  nombre?: string;
  calificacion?: number;
  comentario?: string;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const body = (await req.json().catch(() => ({}))) as CrearComentarioBody;
  const nombre = body.nombre?.trim();
  const texto = body.comentario?.trim();
  const calificacion = Math.round(Number(body.calificacion));

  if (!nombre || !texto) {
    return NextResponse.json({ error: "Falta tu nombre o el comentario" }, { status: 400 });
  }
  if (!Number.isFinite(calificacion) || calificacion < 1 || calificacion > 5) {
    return NextResponse.json({ error: "Calificación inválida" }, { status: 400 });
  }

  try {
    const hotel = await prisma.hotel.findUnique({ where: { slug }, select: { id: true } });
    if (!hotel) throw new Error("Hotel no encontrado");

    const nuevo = await prisma.comentario.create({
      data: { hotelId: hotel.id, nombre, calificacion, comentario: texto },
    });

    return NextResponse.json({ comentario: nuevo }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 400 }
    );
  }
}
