import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import {
  CategoriaConDisponibilidad,
  Habitacion,
  HotelConDisponibilidad,
  Reserva,
  ReservaEstado,
  TurnoHoras,
} from "./types";

export function generarCodigo(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) {
    s += chars[Math.floor(Math.random() * chars.length)];
  }
  return `PT-${s}`;
}

function generarCodigoVoucher(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) {
    s += chars[Math.floor(Math.random() * chars.length)];
  }
  return `PREMIO-${s}`;
}

/** Cada tantas reservas no canceladas, el usuario se gana una habitación gratis. */
const RESERVAS_POR_PREMIO = 10;

const HOTEL_INCLUDE = {
  categorias: {
    orderBy: { orden: "asc" },
    include: {
      habitaciones: { orderBy: { numero: "asc" } },
      turnos: { orderBy: { horas: "asc" } },
    },
  },
} satisfies Prisma.HotelInclude;

type HotelConRelaciones = Prisma.HotelGetPayload<{ include: typeof HOTEL_INCLUDE }>;

/** Marca como finalizadas las reservas cuyo turno ya venció y libera la habitación. */
export async function liberarReservasVencidas(at: Date = new Date()): Promise<void> {
  const vencidas = await prisma.reserva.findMany({
    where: { estado: "activa", fin: { lte: at } },
    select: { id: true, habitacionId: true },
  });
  if (vencidas.length === 0) return;

  await prisma.$transaction([
    prisma.reserva.updateMany({
      where: { id: { in: vencidas.map((r) => r.id) } },
      data: { estado: "finalizada" },
    }),
    ...vencidas
      .filter((r): r is { id: string; habitacionId: string } => !!r.habitacionId)
      .map((r) =>
        prisma.habitacion.update({ where: { id: r.habitacionId }, data: { disponible: true } })
      ),
  ]);
}

async function contarOcupadasPorCategoria(): Promise<Map<string, number>> {
  const grupos = await prisma.reserva.groupBy({
    by: ["categoriaId"],
    where: { estado: "activa" },
    _count: true,
  });
  const mapa = new Map<string, number>();
  for (const g of grupos) {
    if (g.categoriaId) mapa.set(g.categoriaId, g._count);
  }
  return mapa;
}

function construirHotelConDisponibilidad(
  hotel: HotelConRelaciones,
  ocupadasPorCategoria: Map<string, number>
): HotelConDisponibilidad {
  const categorias: CategoriaConDisponibilidad[] = hotel.categorias.map((c) => {
    const habitaciones: Habitacion[] = c.habitaciones.map((h) => ({
      id: h.id,
      numero: h.numero,
      disponible: h.disponible,
    }));
    const disponibles = habitaciones.filter((h) => h.disponible).length;
    return {
      id: c.id,
      nombre: c.nombre,
      descripcion: c.descripcion,
      amenities: c.amenities,
      foto: c.foto,
      habitaciones,
      totalHabitaciones: habitaciones.length,
      disponibles,
      turnos: c.turnos.map((t) => ({
        horas: t.horas as TurnoHoras,
        precio: t.precio,
        activo: t.activo,
      })),
      ocupadas: ocupadasPorCategoria.get(c.id) ?? 0,
    };
  });

  const totalDisponibles = categorias.reduce((sum, c) => sum + c.disponibles, 0);
  const preciosDisponibles = categorias
    .filter((c) => c.disponibles > 0)
    .flatMap((c) => c.turnos.filter((t) => t.activo).map((t) => t.precio));
  const precioDesde = preciosDisponibles.length > 0 ? Math.min(...preciosDisponibles) : null;

  return {
    id: hotel.id,
    slug: hotel.slug,
    nombre: hotel.nombre,
    zona: hotel.zona,
    direccion: hotel.direccion,
    descripcion: hotel.descripcion,
    rating: hotel.rating,
    telefono: hotel.telefono,
    colorDesde: hotel.colorDesde,
    colorHasta: hotel.colorHasta,
    amenitiesGenerales: hotel.amenitiesGenerales,
    reglas: hotel.reglas,
    abierto: hotel.abierto,
    lat: hotel.lat,
    lng: hotel.lng,
    categorias,
    totalDisponibles,
    precioDesde,
  };
}

export async function listarHotelesConDisponibilidad(
  at: Date = new Date()
): Promise<HotelConDisponibilidad[]> {
  await liberarReservasVencidas(at);
  const [hoteles, ocupadas] = await Promise.all([
    prisma.hotel.findMany({ include: HOTEL_INCLUDE, orderBy: { creada: "asc" } }),
    contarOcupadasPorCategoria(),
  ]);
  return hoteles.map((h) => construirHotelConDisponibilidad(h, ocupadas));
}

export async function obtenerHotelConDisponibilidadPorSlug(
  slug: string,
  at: Date = new Date()
): Promise<HotelConDisponibilidad | null> {
  await liberarReservasVencidas(at);
  const [hotel, ocupadas] = await Promise.all([
    prisma.hotel.findUnique({ where: { slug }, include: HOTEL_INCLUDE }),
    contarOcupadasPorCategoria(),
  ]);
  if (!hotel) return null;
  return construirHotelConDisponibilidad(hotel, ocupadas);
}

export async function obtenerHotelConDisponibilidadPorId(
  id: string,
  at: Date = new Date()
): Promise<HotelConDisponibilidad | null> {
  await liberarReservasVencidas(at);
  const [hotel, ocupadas] = await Promise.all([
    prisma.hotel.findUnique({ where: { id }, include: HOTEL_INCLUDE }),
    contarOcupadasPorCategoria(),
  ]);
  if (!hotel) return null;
  return construirHotelConDisponibilidad(hotel, ocupadas);
}

function mapReserva(r: {
  id: string;
  codigo: string;
  hotelId: string;
  categoriaId: string | null;
  habitacionId: string | null;
  turnoHoras: number;
  precio: number;
  clienteNombre: string;
  clienteTelefono: string;
  inicio: Date | null;
  fin: Date | null;
  estado: string;
  creada: Date;
}): Reserva {
  return {
    id: r.id,
    codigo: r.codigo,
    hotelId: r.hotelId,
    categoriaId: r.categoriaId,
    habitacionId: r.habitacionId,
    turnoHoras: r.turnoHoras as TurnoHoras,
    precio: r.precio,
    clienteNombre: r.clienteNombre,
    clienteTelefono: r.clienteTelefono,
    inicio: (r.inicio ?? r.creada).toISOString(),
    fin: (r.fin ?? r.creada).toISOString(),
    estado: r.estado as ReservaEstado,
    creada: r.creada.toISOString(),
  };
}

export async function reservasActivasDeHotel(hotelId: string, at: Date = new Date()) {
  await liberarReservasVencidas(at);
  const reservas = await prisma.reserva.findMany({
    where: { hotelId, estado: "activa", fin: { gt: at } },
    orderBy: { fin: "asc" },
  });
  return reservas.map(mapReserva);
}

interface CrearReservaInput {
  hotelSlug: string;
  categoriaId: string;
  turnoHoras: number;
  // Sin cuenta si reservó de forma anónima: no suma para el premio de
  // fidelidad ni puede canjear uno, pero igual queda registrada la reserva.
  usuarioId?: string;
  clienteNombre: string;
  clienteTelefono: string;
  voucherId?: string;
}

export async function crearReserva(input: CrearReservaInput) {
  await liberarReservasVencidas();

  const hotel = await prisma.hotel.findUnique({ where: { slug: input.hotelSlug } });
  if (!hotel) throw new Error("Hotel no encontrado");
  if (!hotel.abierto) throw new Error("Este alojamiento no está operando en este momento");

  const categoria = await prisma.categoria.findFirst({
    where: { id: input.categoriaId, hotelId: hotel.id },
  });
  if (!categoria) throw new Error("Categoría no encontrada");

  const turno = await prisma.turno.findFirst({
    where: { categoriaId: categoria.id, horas: input.turnoHoras, activo: true },
  });
  if (!turno) throw new Error("Ese turno no está disponible para esta categoría");

  if (input.voucherId && input.usuarioId) {
    const voucher = await prisma.voucher.findFirst({
      where: { id: input.voucherId, usuarioId: input.usuarioId },
    });
    if (!voucher) throw new Error("Premio no encontrado");
    if (voucher.usado) throw new Error("Ese premio ya fue usado");
  }

  // El `where: { disponible: true }` en el update funciona como control de
  // concurrencia: si dos reservas compiten por la misma habitación, el
  // update de la que llega segunda no matchea ninguna fila (count 0) y
  // reintenta con la siguiente libre.
  for (let intento = 0; intento < 5; intento++) {
    const libre = await prisma.habitacion.findFirst({
      where: { categoriaId: categoria.id, disponible: true },
      orderBy: { numero: "asc" },
    });
    if (!libre) throw new Error("Justo se acaba de ocupar la última habitación disponible");

    const resultado = await prisma.habitacion.updateMany({
      where: { id: libre.id, disponible: true },
      data: { disponible: false },
    });
    if (resultado.count === 0) continue;

    // Si viene con premio, lo marcamos usado con un update condicional (mismo
    // patrón que la habitación): si dos pestañas intentan canjear el mismo
    // premio a la vez, solo una gana.
    let voucherAplicado = false;
    if (input.voucherId && input.usuarioId) {
      const resultadoVoucher = await prisma.voucher.updateMany({
        where: { id: input.voucherId, usado: false },
        data: { usado: true, usadoEn: new Date() },
      });
      if (resultadoVoucher.count === 0) {
        await prisma.habitacion.update({ where: { id: libre.id }, data: { disponible: true } });
        throw new Error("Ese premio ya fue usado");
      }
      voucherAplicado = true;
    }

    const ahora = new Date();
    const fin = new Date(ahora.getTime() + input.turnoHoras * 60 * 60 * 1000);
    const reserva = await prisma.reserva.create({
      data: {
        codigo: generarCodigo(),
        hotelId: hotel.id,
        categoriaId: categoria.id,
        habitacionId: libre.id,
        usuarioId: input.usuarioId,
        clienteNombre: input.clienteNombre,
        clienteTelefono: input.clienteTelefono,
        turnoHoras: input.turnoHoras,
        precio: voucherAplicado ? 0 : turno.precio,
        voucherId: voucherAplicado ? input.voucherId : undefined,
        inicio: ahora,
        fin,
        estado: "activa",
      },
    });

    // Lo que sigue (guardar teléfono en el perfil, sumar para el premio de
    // fidelidad) solo aplica si reservó con cuenta. Reservando de forma
    // anónima, la reserva queda igual pero no se vincula a nada.
    let premioGanado = false;
    if (input.usuarioId) {
      // Guardamos el teléfono en el perfil para no volver a pedirlo la próxima vez.
      await prisma.usuario.update({
        where: { id: input.usuarioId },
        data: { telefono: input.clienteTelefono },
      });

      // Cada RESERVAS_POR_PREMIO reservas no canceladas (esta incluida), se
      // gana un premio nuevo automáticamente.
      const totalValidas = await prisma.reserva.count({
        where: { usuarioId: input.usuarioId, estado: { not: "cancelada" } },
      });
      if (totalValidas % RESERVAS_POR_PREMIO === 0) {
        await prisma.voucher.create({
          data: { usuarioId: input.usuarioId, codigo: generarCodigoVoucher() },
        });
        premioGanado = true;
      }
    }

    return {
      reserva: mapReserva(reserva),
      hotelNombre: hotel.nombre,
      categoriaNombre: categoria.nombre,
      direccion: hotel.direccion,
      zona: hotel.zona,
      telefono: hotel.telefono,
      premioGanado,
    };
  }
  throw new Error("Justo se acaba de ocupar la última habitación disponible");
}

export async function actualizarEstadoReserva(
  id: string,
  hotelId: string,
  estado: "finalizada" | "cancelada"
): Promise<Reserva> {
  return prisma.$transaction(async (tx) => {
    const r = await tx.reserva.findUnique({ where: { id } });
    if (!r) throw new Error("Reserva no encontrada");
    if (r.hotelId !== hotelId) throw new Error("No autorizado");

    if (r.estado === "activa" && r.habitacionId) {
      await tx.habitacion.update({ where: { id: r.habitacionId }, data: { disponible: true } });
    }

    const actualizada = await tx.reserva.update({ where: { id }, data: { estado } });
    return mapReserva(actualizada);
  });
}

export async function obtenerVouchersDisponibles(usuarioId: string) {
  const vouchers = await prisma.voucher.findMany({
    where: { usuarioId, usado: false },
    orderBy: { creada: "asc" },
    select: { id: true, codigo: true, creada: true },
  });
  return vouchers.map((v) => ({ id: v.id, codigo: v.codigo, creada: v.creada.toISOString() }));
}

const RESERVA_PERFIL_INCLUDE = {
  hotel: { select: { nombre: true, slug: true } },
  categoria: { select: { nombre: true } },
} satisfies Prisma.ReservaInclude;

type ReservaConPerfil = Prisma.ReservaGetPayload<{ include: typeof RESERVA_PERFIL_INCLUDE }>;

export async function obtenerPerfilCliente(usuarioId: string) {
  await liberarReservasVencidas();

  const reservas: ReservaConPerfil[] = await prisma.reserva.findMany({
    where: { usuarioId },
    orderBy: { creada: "desc" },
    include: RESERVA_PERFIL_INCLUDE,
  });
  const vouchers = await prisma.voucher.findMany({
    where: { usuarioId },
    orderBy: { creada: "desc" },
  });
  const totalValidas = await prisma.reserva.count({
    where: { usuarioId, estado: { not: "cancelada" } },
  });

  const restantes = RESERVAS_POR_PREMIO - (totalValidas % RESERVAS_POR_PREMIO);

  return {
    reservas: reservas.map((r: ReservaConPerfil) => ({
      ...mapReserva(r),
      hotelNombre: r.hotel.nombre,
      hotelSlug: r.hotel.slug,
      categoriaNombre: r.categoria?.nombre ?? "—",
      gratisConPremio: r.voucherId !== null,
    })),
    vouchers: vouchers.map((v) => ({
      id: v.id,
      codigo: v.codigo,
      usado: v.usado,
      usadoEn: v.usadoEn?.toISOString() ?? null,
      creada: v.creada.toISOString(),
    })),
    progreso: {
      totalReservas: totalValidas,
      faltanParaPremio: totalValidas === 0 ? RESERVAS_POR_PREMIO : restantes,
      reservasPorPremio: RESERVAS_POR_PREMIO,
    },
  };
}
