export type TurnoHoras = 1 | 3 | 5;

export interface TurnoPrecio {
  horas: TurnoHoras;
  precio: number;
  activo: boolean;
}

export interface Habitacion {
  id: string;
  numero: string;
  disponible: boolean;
}

export interface Categoria {
  id: string;
  nombre: string;
  descripcion: string;
  amenities: string[];
  foto: string | null;
  habitaciones: Habitacion[];
  /** Derivados de `habitaciones`, se recalculan en cada lectura (ver lib/db.ts). */
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
  categoriaId: string | null;
  habitacionId: string | null;
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

export interface CuentaHotel {
  id: string;
  hotelId: string;
  email: string;
  passwordHash: string;
  creada: string;
}

export interface DB {
  hotels: Hotel[];
  reservas: Reserva[];
  comentarios: Comentario[];
  cuentas: CuentaHotel[];
}

export interface CategoriaConDisponibilidad extends Categoria {
  ocupadas: number;
}

export interface VoucherDisponible {
  id: string;
  codigo: string;
  creada: string;
}

export interface UsuarioSesion {
  usuarioId: string;
  email: string;
  nombre: string;
  telefono: string | null;
  vouchers: VoucherDisponible[];
}

export interface HotelConDisponibilidad extends Omit<Hotel, "categorias"> {
  categorias: CategoriaConDisponibilidad[];
  totalDisponibles: number;
  precioDesde: number | null;
}
