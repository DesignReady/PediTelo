import { Categoria, Comentario, DB, Hotel, TurnoHoras } from "./types";

let uid = 0;
function id(prefix: string): string {
  uid += 1;
  return `${prefix}_${uid}`;
}

function turnos(p1: number, p3: number, p5: number) {
  return [
    { horas: 1 as TurnoHoras, precio: p1, activo: true },
    { horas: 3 as TurnoHoras, precio: p3, activo: true },
    { horas: 5 as TurnoHoras, precio: p5, activo: true },
  ];
}

function reglasDefault(): string[] {
  return [
    "Ingreso exclusivo para mayores de 18 años con documento.",
    "El pago del turno se realiza al ingresar.",
    "Prohibido fumar dentro de las habitaciones.",
    "No se permite el ingreso de mascotas.",
    "Pasado el horario del turno se cobra una fracción adicional.",
  ];
}

function cat(
  nombre: string,
  descripcion: string,
  amenities: string[],
  totalHabitaciones: number,
  precios: [number, number, number]
): Categoria {
  return {
    id: id("cat"),
    nombre,
    descripcion,
    amenities,
    foto: null,
    totalHabitaciones,
    disponibles: totalHabitaciones,
    turnos: turnos(...precios),
  };
}

export function seedHotels(): Hotel[] {
  return [
    {
      id: id("hotel"),
      slug: "luna-palermo",
      nombre: "Luna Palermo",
      zona: "Palermo, CABA",
      direccion: "Av. Santa Fe 4200",
      descripcion:
        "Alojamiento por horas en pleno Palermo, pensado para parejas que buscan comodidad y privacidad. Habitaciones climatizadas, cochera propia y check-in discreto las 24 horas.",
      reglas: reglasDefault(),
      rating: 4.6,
      telefono: "11-4000-1001",
      lat: -34.5875,
      lng: -58.4205,
      colorDesde: "#f472b6",
      colorHasta: "#db2777",
      amenitiesGenerales: ["Cochera propia", "Ingreso discreto", "WiFi", "Seguridad 24h"],
      abierto: true,
      categorias: [
        cat("Standard", "Habitación climatizada con TV y frigobar.", ["Aire acondicionado", "TV cable", "Frigobar"], 6, [9000, 15000, 21000]),
        cat("Suite Jacuzzi", "Hidromasaje doble, iluminación LED y minibar.", ["Jacuzzi", "Minibar", "Cama redonda", "TV cable", "Parlantes"], 4, [14000, 22000, 30000]),
        cat("Premium", "La suite más grande, con cochera reservada.", ["Jacuzzi", "Cochera reservada", "Cama redonda", "Sonido bluetooth", "Sillón", "Servicios de streaming"], 2, [18000, 27000, 36000]),
      ],
    },
    {
      id: id("hotel"),
      slug: "cielo-recoleta",
      nombre: "Cielo Recoleta",
      zona: "Recoleta, CABA",
      direccion: "Av. Las Heras 2450",
      descripcion:
        "El clásico de Recoleta: ambientes premium, room service y atención cuidada en cada detalle. Ideal para quienes buscan una experiencia más exclusiva.",
      reglas: reglasDefault(),
      rating: 4.8,
      telefono: "11-4000-1002",
      lat: -34.5895,
      lng: -58.3974,
      colorDesde: "#fb7185",
      colorHasta: "#e11d48",
      amenitiesGenerales: ["Cochera propia", "Room service", "WiFi", "Ingreso por control remoto"],
      abierto: true,
      categorias: [
        cat("Standard", "Habitación cómoda ideal para una escapada corta.", ["Aire acondicionado", "TV cable"], 5, [9500, 15500, 21500]),
        cat("Suite Jacuzzi", "Hidromasaje panorámico y decoración premium.", ["Jacuzzi", "Minibar", "Vista panorámica", "Servicios de streaming"], 3, [15000, 23000, 31000]),
      ],
    },
    {
      id: id("hotel"),
      slug: "aurora-almagro",
      nombre: "Aurora Almagro",
      zona: "Almagro, CABA",
      direccion: "Av. Rivadavia 3800",
      descripcion:
        "Recién renovado, con habitaciones temáticas y buena relación precio-calidad. A pocas cuadras de la Av. Corrientes.",
      reglas: reglasDefault(),
      rating: 4.3,
      telefono: "11-4000-1003",
      lat: -34.6082,
      lng: -58.4204,
      colorDesde: "#f9a8d4",
      colorHasta: "#ec4899",
      amenitiesGenerales: ["Cochera propia", "Ingreso discreto", "WiFi"],
      abierto: true,
      categorias: [
        cat("Standard", "Habitación funcional recién renovada.", ["Aire acondicionado", "TV cable", "Ducha escocesa"], 8, [8000, 13500, 19000]),
        cat("Suite Temática", "Ambientación especial con luces y espejos.", ["Espejos", "Luces LED", "Cama redonda"], 3, [12000, 19000, 26000]),
      ],
    },
    {
      id: id("hotel"),
      slug: "tulipan-caballito",
      nombre: "Tulipán Caballito",
      zona: "Caballito, CABA",
      direccion: "Av. Pedro Goyena 1200",
      descripcion:
        "Opción clásica y prolija en Caballito, con cochera propia y buena relación precio-calidad para escapadas cortas.",
      reglas: reglasDefault(),
      rating: 4.1,
      telefono: "11-4000-1004",
      lat: -34.6178,
      lng: -58.4383,
      colorDesde: "#f472b6",
      colorHasta: "#be185d",
      amenitiesGenerales: ["Cochera propia", "WiFi", "Seguridad 24h"],
      abierto: true,
      categorias: [
        cat("Standard", "Habitación clásica, ideal relación precio-calidad.", ["Aire acondicionado", "TV"], 7, [7500, 12500, 17500]),
        cat("Suite Jacuzzi", "Hidromasaje y minibar surtido.", ["Jacuzzi", "Minibar"], 2, [13000, 20000, 27000]),
      ],
    },
    {
      id: id("hotel"),
      slug: "punto-rosa-avellaneda",
      nombre: "Punto Rosa Avellaneda",
      zona: "Avellaneda, GBA Sur",
      direccion: "Av. Mitre 900",
      descripcion:
        "Alojamiento amplio y luminoso en Avellaneda, con la mejor opción de la zona en su categoría Premium con cochera propia.",
      reglas: reglasDefault(),
      rating: 4.0,
      telefono: "11-4000-1005",
      lat: -34.6626,
      lng: -58.3654,
      colorDesde: "#fda4af",
      colorHasta: "#e11d48",
      amenitiesGenerales: ["Cochera propia", "Ingreso discreto", "WiFi"],
      abierto: true,
      categorias: [
        cat("Standard", "Habitación amplia con buena ventilación.", ["Aire acondicionado", "TV cable"], 6, [7000, 11500, 16000]),
        cat("Premium", "La mejor opción de la casa, con cochera propia.", ["Jacuzzi", "Cochera reservada", "Minibar"], 2, [13500, 21000, 28000]),
      ],
    },
    {
      id: id("hotel"),
      slug: "beso-quilmes",
      nombre: "Beso Quilmes",
      zona: "Quilmes, GBA Sur",
      direccion: "Av. Calchaquí 3100",
      descripcion:
        "Alojamiento simple y prolijo en Quilmes, con la mejor relación precio-calidad de la zona sur.",
      reglas: reglasDefault(),
      rating: 3.9,
      telefono: "11-4000-1006",
      lat: -34.7203,
      lng: -58.2545,
      colorDesde: "#f9a8d4",
      colorHasta: "#db2777",
      amenitiesGenerales: ["Cochera propia", "WiFi"],
      abierto: true,
      categorias: [
        cat("Standard", "Habitación simple y prolija.", ["Aire acondicionado", "TV"], 5, [6500, 11000, 15500]),
        cat("Suite Jacuzzi", "Hidromasaje con cromoterapia.", ["Jacuzzi", "Cromoterapia"], 2, [11500, 18000, 24500]),
      ],
    },
    {
      id: id("hotel"),
      slug: "eclipse-vicente-lopez",
      nombre: "Eclipse Vicente López",
      zona: "Vicente López, GBA Norte",
      direccion: "Av. Maipú 2100",
      descripcion:
        "Alojamiento moderno en Vicente López, con jardín interno y la suite Premium más exclusiva de la cadena.",
      reglas: reglasDefault(),
      rating: 4.5,
      telefono: "11-4000-1007",
      lat: -34.5267,
      lng: -58.4732,
      colorDesde: "#fb7185",
      colorHasta: "#9d174d",
      amenitiesGenerales: ["Cochera propia", "Room service", "WiFi", "Seguridad 24h"],
      abierto: true,
      categorias: [
        cat("Standard", "Habitación moderna con buena luz natural.", ["Aire acondicionado", "TV cable"], 5, [9800, 16000, 22000]),
        cat("Suite Jacuzzi", "Hidromasaje con vista a jardín interno.", ["Jacuzzi", "Jardín interno", "Minibar"], 3, [15500, 24000, 32000]),
        cat("Premium", "Suite más exclusiva, cochera cerrada individual.", ["Jacuzzi", "Cochera individual", "Sonido bluetooth", "Minibar", "Barra para bailar", "Sillón"], 1, [19500, 29000, 38000]),
      ],
    },
    {
      id: id("hotel"),
      slug: "sensacion-san-justo",
      nombre: "Sensación San Justo",
      zona: "San Justo, GBA Oeste",
      direccion: "Av. Rivadavia 15800",
      descripcion:
        "Alojamiento cómodo y cálido en San Justo, con habitaciones temáticas y buena disponibilidad todos los días.",
      reglas: reglasDefault(),
      rating: 4.2,
      telefono: "11-4000-1008",
      lat: -34.6889,
      lng: -58.5631,
      colorDesde: "#f472b6",
      colorHasta: "#a21caf",
      amenitiesGenerales: ["Cochera propia", "Ingreso discreto", "WiFi"],
      abierto: true,
      categorias: [
        cat("Standard", "Habitación cómoda con ambientación cálida.", ["Aire acondicionado", "TV cable"], 6, [7200, 12000, 16800]),
        cat("Suite Temática", "Decoración especial y cama circular.", ["Cama redonda", "Luces LED"], 3, [11800, 18500, 25000]),
      ],
    },
  ];
}

function comentario(hotelId: string, nombre: string, calificacion: number, texto: string, horasAtras: number): Comentario {
  return {
    id: id("com"),
    hotelId,
    nombre,
    calificacion,
    comentario: texto,
    creada: new Date(Date.now() - horasAtras * 60 * 60 * 1000).toISOString(),
  };
}

export function seedComentarios(hotels: Hotel[]): Comentario[] {
  const porSlug = Object.fromEntries(hotels.map((h) => [h.slug, h.id]));
  const out: Comentario[] = [];
  const luna = porSlug["luna-palermo"];
  const cielo = porSlug["cielo-recoleta"];
  const tulipan = porSlug["tulipan-caballito"];

  if (luna) {
    out.push(comentario(luna, "Marcos", 5, "Excelente atención, la suite jacuzzi impecable y muy discreto el ingreso.", 30));
    out.push(comentario(luna, "Vale", 4, "Buena relación precio calidad, tardaron un poco en confirmar pero todo bien.", 90));
  }
  if (cielo) {
    out.push(comentario(cielo, "R.", 5, "El mejor de la zona, reservé desde la web y estaba todo listo al llegar.", 12));
  }
  if (tulipan) {
    out.push(comentario(tulipan, "Nadia", 4, "Habitación cómoda y limpia, la cochera es un montón.", 200));
  }
  return out;
}

export function seedDB(): DB {
  const hotels = seedHotels();
  return {
    hotels,
    reservas: [],
    comentarios: seedComentarios(hotels),
    cuentas: [],
  };
}
