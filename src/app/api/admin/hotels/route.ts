import { NextResponse } from "next/server";
import { readDB } from "@/lib/store";

export async function GET() {
  try {
    const db = await readDB();
    const hotels = db.hotels.map((h) => ({
      id: h.id,
      slug: h.slug,
      nombre: h.nombre,
      zona: h.zona,
    }));
    return NextResponse.json({ hotels });
  } catch (e) {
    console.error("GET /api/admin/hotels", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error interno" },
      { status: 500 }
    );
  }
}
