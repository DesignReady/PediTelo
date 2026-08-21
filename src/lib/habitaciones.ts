import { Categoria, Habitacion } from "./types";

/** totalHabitaciones/disponibles son derivados de `habitaciones`; llamar después de cualquier cambio. */
export function sincronizarConteo(categoria: Categoria): void {
  categoria.totalHabitaciones = categoria.habitaciones.length;
  categoria.disponibles = categoria.habitaciones.filter((h) => h.disponible).length;
}

/** Marca la primera habitación libre como ocupada. Devuelve null si no hay ninguna. */
export function ocuparHabitacion(categoria: Categoria): Habitacion | null {
  const libre = categoria.habitaciones.find((h) => h.disponible);
  if (!libre) return null;
  libre.disponible = false;
  sincronizarConteo(categoria);
  return libre;
}

/**
 * Libera una habitación puntual. Si no se pasa habitacionId (reservas viejas
 * de antes de este modelo) o esa habitación ya no existe, libera cualquier
 * habitación ocupada de la categoría como mejor esfuerzo.
 */
export function liberarHabitacion(categoria: Categoria, habitacionId?: string | null): void {
  if (habitacionId) {
    const h = categoria.habitaciones.find((x) => x.id === habitacionId);
    if (h) {
      h.disponible = true;
      sincronizarConteo(categoria);
      return;
    }
  }
  const ocupada = categoria.habitaciones.find((h) => !h.disponible);
  if (ocupada) {
    ocupada.disponible = true;
    sincronizarConteo(categoria);
  }
}
