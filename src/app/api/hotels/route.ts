import { NextRequest, NextResponse } from "next/server";
import { readDBSincronizada } from "@/lib/store";
import { hotelConDisponibilidad } from "@/lib/availability";

export async function GET(req: NextRequest) {
  try {
    const db = await readDBSincronizada();
    const { searchParams } = new URL(req.url);
    const soloDisponibles = searchParams.get("disponible") !== "false";
    const zona = searchParams.get("zona");
    const precioMinParam = searchParams.get("precioMin");
    const precioMaxParam = searchParams.get("precioMax");
    const precioMin = precioMinParam ? Number(precioMinParam) : null;
    const precioMax = precioMaxParam ? Number(precioMaxParam) : null;

    let hotels = db.hotels.map((h) => hotelConDisponibilidad(db, h));

    if (zona) hotels = hotels.filter((h) => h.zona === zona);

    if (precioMin !== null || precioMax !== null) {
      hotels = hotels.filter((h) =>
        h.categorias.some((c) =>
          c.turnos.some(
            (t) =>
              t.activo &&
              (precioMin === null || t.precio >= precioMin) &&
              (precioMax === null || t.precio <= precioMax)
          )
        )
      );
    }

    if (soloDisponibles) {
      hotels = hotels.filter((h) => h.abierto && h.totalDisponibles > 0);
    }

    hotels.sort((a, b) => (a.precioDesde ?? Infinity) - (b.precioDesde ?? Infinity));

    const zonas = Array.from(new Set(db.hotels.map((h) => h.zona))).sort();

    const todosLosPrecios = db.hotels.flatMap((h) =>
      h.categorias.flatMap((c) => c.turnos.map((t) => t.precio))
    );
    const rangoPrecios = {
      min: todosLosPrecios.length ? Math.min(...todosLosPrecios) : 0,
      max: todosLosPrecios.length ? Math.max(...todosLosPrecios) : 0,
    };

    return NextResponse.json({ hotels, zonas, rangoPrecios });
  } catch (e) {
    console.error("GET /api/hotels", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error interno" },
      { status: 500 }
    );
  }
}
