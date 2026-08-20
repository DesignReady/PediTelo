export type TurnoHoras = 1 | 3 | 5;

export interface TurnoPrecio {
  horas: TurnoHoras;
  precio: number;
  activo: boolean;
}

export interface Categoria {
  id: string;
  nombre: string;
  descripcion: string;
  amenities: string[];
  foto: string | null;
  totalHabitaciones: number;
  disponibles: number;
  turnos: TurnoPrecio[];
}

export interface Hotel {
  id: string;
  slug: string;
  nombre: string;
  zona: string;
  direccion: string;
  descripcion: string;
  rating: number;
  telefono: string;
  colorDesde: string;
  colorHasta: string;
  amenitiesGenerales: string[];
  reglas: string[];
  abierto: boolean;
  lat: number;
  lng: number;
  categorias: Categoria[];
}

export type ReservaEstado = "activa" | "finalizada" | "cancelada";

export interface Reserva {
  id: string;
  codigo: string;
  hotelId: string;
  categoriaId: string;
  turnoHoras: TurnoHoras;
  precio: number;
  clienteNombre: string;
  clienteTelefono: string;
  inicio: string;
  fin: string;
  estado: ReservaEstado;
  creada: string;
}

export interface Comentario {
  id: string;
  hotelId: string;
  nombre: string;
  calificacion: number;
  comentario: string;
  creada: string;
}

export interface DB {
  hotels: Hotel[];
  reservas: Reserva[];
  comentarios: Comentario[];
}

export interface CategoriaConDisponibilidad extends Categoria {
  ocupadas: number;
}

export interface HotelConDisponibilidad extends Omit<Hotel, "categorias"> {
  categorias: CategoriaConDisponibilidad[];
  totalDisponibles: number;
  precioDesde: number | null;
}
