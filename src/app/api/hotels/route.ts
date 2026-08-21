import { NextRequest, NextResponse } from "next/server";
import { readDBSincronizada } from "@/lib/store";
import { hotelConDisponibilidad } from "@/lib/availability";
import { HotelConDisponibilidad } from "@/lib/types";

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function coincide(amenity: string, buscado: string): boolean {
  const a = amenity.toLowerCase();
  const b = buscado.toLowerCase();
  return a.includes(b) || b.includes(a);
}

function hotelTieneServicio(hotel: HotelConDisponibilidad, servicio: string): boolean {
  const todos = [
    ...hotel.amenitiesGenerales,
    ...hotel.categorias.flatMap((c) => c.amenities),
  ];
  return todos.some((a) => coincide(a, servicio));
}

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
    const serviciosParam = searchParams.get("servicios");
    const servicios = serviciosParam
      ? serviciosParam.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
    const q = searchParams.get("q")?.trim() ?? "";

    let hotels = db.hotels.map((h) => hotelConDisponibilidad(db, h));

    if (q) {
      const qNorm = normalizar(q);
      hotels = hotels.filter((h) => normalizar(h.nombre).includes(qNorm));
    }

    if (zona) hotels = hotels.filter((h) => h.zona === zona);

    if (servicios.length > 0) {
      hotels = hotels.filter((h) => servicios.every((s) => hotelTieneServicio(h, s)));
    }

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
