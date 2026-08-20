import { NextRequest, NextResponse } from "next/server";
import { esSuperadminDesdeRequest } from "@/lib/auth";
import { readDB } from "@/lib/store";

export async function GET(req: NextRequest) {
  if (!(await esSuperadminDesdeRequest(req))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const db = await readDB();
  const hotels = db.hotels.map((h) => {
    const cuenta = db.cuentas.find((c) => c.hotelId === h.id);
    return {
      id: h.id,
      slug: h.slug,
      nombre: h.nombre,
      zona: h.zona,
      email: cuenta?.email ?? null,
    };
  });

  return NextResponse.json({ hotels });
}
