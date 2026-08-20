import { CategoriaConDisponibilidad, DB, Hotel, HotelConDisponibilidad } from "./types";
import { ocupadasDe } from "./store";

export function categoriaConDisponibilidad(
  db: DB,
  hotel: Hotel,
  categoria: Hotel["categorias"][number],
  at: Date = new Date()
): CategoriaConDisponibilidad {
  const ocupadas = ocupadasDe(db, hotel.id, categoria.id, at);
  return { ...categoria, ocupadas };
}

export function hotelConDisponibilidad(
  db: DB,
  hotel: Hotel,
  at: Date = new Date()
): HotelConDisponibilidad {
  const categorias = hotel.categorias.map((c) => categoriaConDisponibilidad(db, hotel, c, at));
  const totalDisponibles = categorias.reduce((sum, c) => sum + c.disponibles, 0);
  const preciosDisponibles = categorias
    .filter((c) => c.disponibles > 0)
    .flatMap((c) => c.turnos.filter((t) => t.activo).map((t) => t.precio));
  const precioDesde = preciosDisponibles.length > 0 ? Math.min(...preciosDisponibles) : null;
  return { ...hotel, categorias, totalDisponibles, precioDesde };
}
