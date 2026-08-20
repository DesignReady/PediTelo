import { NextRequest, NextResponse } from "next/server";
import { generarId, mutateDB } from "@/lib/store";
import { Comentario } from "@/lib/types";

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
    const nuevo = await mutateDB((db) => {
      const hotel = db.hotels.find((h) => h.slug === slug);
      if (!hotel) throw new Error("Hotel no encontrado");
      const comentario: Comentario = {
        id: generarId("com"),
        hotelId: hotel.id,
        nombre,
        calificacion,
        comentario: texto,
        creada: new Date().toISOString(),
      };
      db.comentarios.push(comentario);
      return comentario;
    });

    return NextResponse.json({ comentario: nuevo }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 400 }
    );
  }
}
