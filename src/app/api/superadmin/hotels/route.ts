import { NextRequest, NextResponse } from "next/server";
import { esSuperadminDesdeRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  if (!(await esSuperadminDesdeRequest(req))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const hoteles = await prisma.hotel.findMany({
    select: {
      id: true,
      slug: true,
      nombre: true,
      zona: true,
      cuenta: { select: { email: true } },
    },
    orderBy: { creada: "asc" },
  });

  const hotels = hoteles.map((h) => ({
    id: h.id,
    slug: h.slug,
    nombre: h.nombre,
    zona: h.zona,
    email: h.cuenta?.email ?? null,
  }));

  return NextResponse.json({ hotels });
}
