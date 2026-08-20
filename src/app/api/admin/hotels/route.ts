import { NextResponse } from "next/server";
import { readDB } from "@/lib/store";

export async function GET() {
  const db = await readDB();
  const hotels = db.hotels.map((h) => ({
    id: h.id,
    slug: h.slug,
    nombre: h.nombre,
    zona: h.zona,
  }));
  return NextResponse.json({ hotels });
}
