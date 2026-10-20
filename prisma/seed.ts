import "dotenv/config";
import { config as loadEnvLocal } from "dotenv";
loadEnvLocal({ path: ".env.local", override: true });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type TurnoSeed = { horas: number; precio: number; activo: boolean };

function turnos(p1: number, p3: number, p5: number): TurnoSeed[] {
  return [
    { horas: 1, precio: p1, activo: true },
    { horas: 3, precio: p3, activo: true },
    { horas: 5, precio: p5, activo: true },
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

/** Numeración estilo hotel real: piso 1 → 101,102…, piso 2 → 201,202…, etc. */
function habitaciones(piso: number, cantidad: number) {
  return Array.from({ length: cantidad }, (_, i) => ({ numero: String(piso * 100 + i + 1) }));
}

interface CategoriaSeed {
  foto?: string;
  nombre: string;
  descripcion: string;
  amenities: string[];
  piso: number;
  cantidad: number;
  precios: [number, number, number];
}

function cat(
  piso: number,
  nombre: string,
  descripcion: string,
  amenities: string[],
  cantidad: number,
  precios: [number, number, number]
): CategoriaSeed {
  return { nombre, descripcion, amenities, piso, cantidad, precios };
}

interface HotelSeed {
  slug: string;
  nombre: string;
  zona: string;
  direccion: string;
  descripcion: string;
  rating: number;
  telefono: string;
  lat: number;
  lng: number;
  colorDesde: string;
  colorHasta: string;
  amenitiesGenerales: string[];
  categorias: CategoriaSeed[];
  comentarios?: { nombre: string; calificacion: number; comentario: string; horasAtras: number }[];
}

const hotelesBase: HotelSeed[] = [
  {
    slug: "luna-palermo",
    nombre: "Luna Palermo",
    zona: "Palermo, CABA",
    direccion: "Av. Santa Fe 4200",
    descripcion:
      "Alojamiento por horas en pleno Palermo, pensado para parejas que buscan comodidad y privacidad. Habitaciones climatizadas, cochera propia y check-in discreto las 24 horas.",
    rating: 4.6,
    telefono: "11-4000-1001",
    lat: -34.5875,
    lng: -58.4205,
    colorDesde: "#f472b6",
    colorHasta: "#db2777",
    amenitiesGenerales: ["Cochera propia", "Ingreso discreto", "WiFi", "Seguridad 24h"],
    categorias: [
      cat(1, "Standard", "Habitación climatizada con TV y frigobar.", ["Aire acondicionado", "TV cable", "Frigobar"], 6, [9000, 15000, 21000]),
      cat(2, "Suite Jacuzzi", "Hidromasaje doble, iluminación LED y minibar.", ["Jacuzzi", "Minibar", "Cama redonda", "TV cable", "Parlantes"], 4, [14000, 22000, 30000]),
      cat(3, "Premium", "La suite más grande, con cochera reservada.", ["Jacuzzi", "Cochera reservada", "Cama redonda", "Sonido bluetooth", "Sillón", "Servicios de streaming"], 2, [18000, 27000, 36000]),
    ],
    comentarios: [
      { nombre: "Marcos", calificacion: 5, comentario: "Excelente atención, la suite jacuzzi impecable y muy discreto el ingreso.", horasAtras: 30 },
      { nombre: "Vale", calificacion: 4, comentario: "Buena relación precio calidad, tardaron un poco en confirmar pero todo bien.", horasAtras: 90 },
    ],
  },
  {
    slug: "cielo-recoleta",
    nombre: "Cielo Recoleta",
    zona: "Recoleta, CABA",
    direccion: "Av. Las Heras 2450",
    descripcion:
      "El clásico de Recoleta: ambientes premium, room service y atención cuidada en cada detalle. Ideal para quienes buscan una experiencia más exclusiva.",
    rating: 4.8,
    telefono: "11-4000-1002",
    lat: -34.5895,
    lng: -58.3974,
    colorDesde: "#fb7185",
    colorHasta: "#e11d48",
    amenitiesGenerales: ["Cochera propia", "Room service", "WiFi", "Ingreso por control remoto"],
    categorias: [
      cat(1, "Standard", "Habitación cómoda ideal para una escapada corta.", ["Aire acondicionado", "TV cable"], 5, [9500, 15500, 21500]),
      cat(2, "Suite Jacuzzi", "Hidromasaje panorámico y decoración premium.", ["Jacuzzi", "Minibar", "Vista panorámica", "Servicios de streaming"], 3, [15000, 23000, 31000]),
    ],
    comentarios: [
      { nombre: "R.", calificacion: 5, comentario: "El mejor de la zona, reservé desde la web y estaba todo listo al llegar.", horasAtras: 12 },
    ],
  },
  {
    slug: "aurora-almagro",
    nombre: "Aurora Almagro",
    zona: "Almagro, CABA",
    direccion: "Av. Rivadavia 3800",
    descripcion:
      "Recién renovado, con habitaciones temáticas y buena relación precio-calidad. A pocas cuadras de la Av. Corrientes.",
    rating: 4.3,
    telefono: "11-4000-1003",
    lat: -34.6082,
    lng: -58.4204,
    colorDesde: "#f9a8d4",
    colorHasta: "#ec4899",
    amenitiesGenerales: ["Cochera propia", "Ingreso discreto", "WiFi"],
    categorias: [
      cat(1, "Standard", "Habitación funcional recién renovada.", ["Aire acondicionado", "TV cable", "Ducha escocesa"], 8, [8000, 13500, 19000]),
      cat(2, "Suite Temática", "Ambientación especial con luces y espejos.", ["Espejos", "Luces LED", "Cama redonda"], 3, [12000, 19000, 26000]),
    ],
  },
  {
    slug: "tulipan-caballito",
    nombre: "Tulipán Caballito",
    zona: "Caballito, CABA",
    direccion: "Av. Pedro Goyena 1200",
    descripcion:
      "Opción clásica y prolija en Caballito, con cochera propia y buena relación precio-calidad para escapadas cortas.",
    rating: 4.1,
    telefono: "11-4000-1004",
    lat: -34.6178,
    lng: -58.4383,
    colorDesde: "#f472b6",
    colorHasta: "#be185d",
    amenitiesGenerales: ["Cochera propia", "WiFi", "Seguridad 24h"],
    categorias: [
      cat(1, "Standard", "Habitación clásica, ideal relación precio-calidad.", ["Aire acondicionado", "TV"], 7, [7500, 12500, 17500]),
      cat(2, "Suite Jacuzzi", "Hidromasaje y minibar surtido.", ["Jacuzzi", "Minibar"], 2, [13000, 20000, 27000]),
    ],
    comentarios: [
      { nombre: "Nadia", calificacion: 4, comentario: "Habitación cómoda y limpia, la cochera es un montón.", horasAtras: 200 },
    ],
  },
  {
    slug: "punto-rosa-avellaneda",
    nombre: "Punto Rosa Avellaneda",
    zona: "Avellaneda, GBA Sur",
    direccion: "Av. Mitre 900",
    descripcion:
      "Alojamiento amplio y luminoso en Avellaneda, con la mejor opción de la zona en su categoría Premium con cochera propia.",
    rating: 4.0,
    telefono: "11-4000-1005",
    lat: -34.6626,
    lng: -58.3654,
    colorDesde: "#fda4af",
    colorHasta: "#e11d48",
    amenitiesGenerales: ["Cochera propia", "Ingreso discreto", "WiFi"],
    categorias: [
      cat(1, "Standard", "Habitación amplia con buena ventilación.", ["Aire acondicionado", "TV cable"], 6, [7000, 11500, 16000]),
      cat(2, "Premium", "La mejor opción de la casa, con cochera propia.", ["Jacuzzi", "Cochera reservada", "Minibar"], 2, [13500, 21000, 28000]),
    ],
  },
  {
    slug: "beso-quilmes",
    nombre: "Beso Quilmes",
    zona: "Quilmes, GBA Sur",
    direccion: "Av. Calchaquí 3100",
    descripcion:
      "Alojamiento simple y prolijo en Quilmes, con la mejor relación precio-calidad de la zona sur.",
    rating: 3.9,
    telefono: "11-4000-1006",
    lat: -34.7203,
    lng: -58.2545,
    colorDesde: "#f9a8d4",
    colorHasta: "#db2777",
    amenitiesGenerales: ["Cochera propia", "WiFi"],
    categorias: [
      cat(1, "Standard", "Habitación simple y prolija.", ["Aire acondicionado", "TV"], 5, [6500, 11000, 15500]),
      cat(2, "Suite Jacuzzi", "Hidromasaje con cromoterapia.", ["Jacuzzi", "Cromoterapia"], 2, [11500, 18000, 24500]),
    ],
  },
  {
    slug: "eclipse-vicente-lopez",
    nombre: "Eclipse Vicente López",
    zona: "Vicente López, GBA Norte",
    direccion: "Av. Maipú 2100",
    descripcion:
      "Alojamiento moderno en Vicente López, con jardín interno y la suite Premium más exclusiva de la cadena.",
    rating: 4.5,
    telefono: "11-4000-1007",
    lat: -34.5267,
    lng: -58.4732,
    colorDesde: "#fb7185",
    colorHasta: "#9d174d",
    amenitiesGenerales: ["Cochera propia", "Room service", "WiFi", "Seguridad 24h"],
    categorias: [
      cat(1, "Standard", "Habitación moderna con buena luz natural.", ["Aire acondicionado", "TV cable"], 5, [9800, 16000, 22000]),
      cat(2, "Suite Jacuzzi", "Hidromasaje con vista a jardín interno.", ["Jacuzzi", "Jardín interno", "Minibar"], 3, [15500, 24000, 32000]),
      cat(3, "Premium", "Suite más exclusiva, cochera cerrada individual.", ["Jacuzzi", "Cochera individual", "Sonido bluetooth", "Minibar", "Barra para bailar", "Sillón"], 1, [19500, 29000, 38000]),
    ],
  },
  {
    slug: "sensacion-san-justo",
    nombre: "Sensación San Justo",
    zona: "San Justo, GBA Oeste",
    direccion: "Av. Rivadavia 15800",
    descripcion:
      "Alojamiento cómodo y cálido en San Justo, con habitaciones temáticas y buena disponibilidad todos los días.",
    rating: 4.2,
    telefono: "11-4000-1008",
    lat: -34.6889,
    lng: -58.5631,
    colorDesde: "#f472b6",
    colorHasta: "#a21caf",
    amenitiesGenerales: ["Cochera propia", "Ingreso discreto", "WiFi"],
    categorias: [
      cat(1, "Standard", "Habitación cómoda con ambientación cálida.", ["Aire acondicionado", "TV cable"], 6, [7200, 12000, 16800]),
      cat(2, "Suite Temática", "Decoración especial y cama circular.", ["Cama redonda", "Luces LED"], 3, [11800, 18500, 25000]),
    ],
  },
];

/** Los precios originales (6.500–38.000) se llevan al rango actual: $40.000–$150.000. */
function escalar(precio: number): number {
  return Math.round((40000 + ((precio - 6500) * 110000) / 31500) / 500) * 500;
}
for (const h of hotelesBase) {
  for (const c of h.categorias) c.precios = c.precios.map(escalar) as [number, number, number];
}

// Categorías nuevas para hoteles que ya existían (precios ya en el rango nuevo).
const categoriasExtra: Record<string, CategoriaSeed[]> = {
  "cielo-recoleta": [
    cat(3, "Premium", "Suite amplia con jacuzzi, cochera reservada y room service.", ["Jacuzzi", "Cochera reservada", "Sonido bluetooth", "Minibar", "Servicios de streaming"], 2, [82000, 112000, 140000]),
  ],
  "aurora-almagro": [
    cat(3, "Suite Jacuzzi", "Hidromasaje doble con luces LED y minibar.", ["Jacuzzi", "Minibar", "Luces LED"], 2, [68000, 97000, 125000]),
  ],
  "tulipan-caballito": [
    cat(3, "Premium", "La habitación más completa de la casa.", ["Jacuzzi", "Cochera reservada", "Minibar", "Sillón"], 1, [78000, 108000, 135000]),
  ],
  "beso-quilmes": [
    cat(3, "Suite Temática", "Ambientación especial con espejos y luces.", ["Espejos", "Luces LED", "Cama redonda"], 2, [62000, 90000, 118000]),
  ],
  "sensacion-san-justo": [
    cat(3, "Suite Jacuzzi", "Hidromasaje con cromoterapia y minibar.", ["Jacuzzi", "Cromoterapia", "Minibar"], 2, [60000, 88000, 115000]),
  ],
};
for (const h of hotelesBase) h.categorias.push(...(categoriasExtra[h.slug] ?? []));

const hotelesNuevos: HotelSeed[] = [
  {
    slug: "terciopelo-flores",
    nombre: "Terciopelo Flores",
    zona: "Flores, CABA",
    direccion: "Av. Rivadavia 7200",
    descripcion:
      "Alojamiento clásico en Flores con ambientes cálidos, cochera propia y atención discreta las 24 horas.",
    rating: 4.3,
    telefono: "11-4000-1009",
    lat: -34.6285,
    lng: -58.4636,
    colorDesde: "#f472b6",
    colorHasta: "#be185d",
    amenitiesGenerales: ["Cochera propia", "Ingreso discreto", "WiFi", "Seguridad 24h"],
    categorias: [
      cat(1, "Standard", "Habitación luminosa con cama king y TV.", ["Aire acondicionado", "TV cable", "Frigobar"], 7, [44000, 64000, 82000]),
      cat(2, "Suite Jacuzzi", "Hidromasaje doble y minibar.", ["Jacuzzi", "Minibar", "Luces LED"], 3, [66000, 94000, 121000]),
      cat(3, "Premium", "Suite grande con sillón, sonido y cochera reservada.", ["Jacuzzi", "Cochera reservada", "Sonido bluetooth", "Sillón"], 2, [88000, 118000, 146000]),
    ],
    comentarios: [
      { nombre: "Lau", calificacion: 4, comentario: "Muy limpio y tranquilo, el jacuzzi estaba perfecto.", horasAtras: 48 },
    ],
  },
  {
    slug: "noche-dorada-belgrano",
    nombre: "Noche Dorada Belgrano",
    zona: "Belgrano, CABA",
    direccion: "Av. Cabildo 2600",
    descripcion:
      "Ambientes de diseño en Belgrano, con room service, ingreso por control remoto y suites premium.",
    rating: 4.7,
    telefono: "11-4000-1010",
    lat: -34.5627,
    lng: -58.4563,
    colorDesde: "#fbbf24",
    colorHasta: "#db2777",
    amenitiesGenerales: ["Cochera propia", "Room service", "WiFi", "Ingreso por control remoto"],
    categorias: [
      cat(1, "Standard", "Habitación de diseño con luz cálida.", ["Aire acondicionado", "TV cable", "Frigobar"], 6, [52000, 76000, 98000]),
      cat(2, "Suite Temática", "Ambientación especial con luces y espejos.", ["Espejos", "Luces LED", "Cama redonda", "Sonido bluetooth"], 3, [74000, 104000, 130000]),
      cat(3, "Premium", "La suite más exclusiva, con jacuzzi y vista panorámica.", ["Jacuzzi", "Vista panorámica", "Minibar", "Servicios de streaming"], 2, [96000, 125000, 150000]),
    ],
    comentarios: [
      { nombre: "Fede", calificacion: 5, comentario: "Impecable, el mejor servicio que probamos en la zona.", horasAtras: 20 },
      { nombre: "Caro", calificacion: 5, comentario: "Muy discreto y la suite premium vale cada peso.", horasAtras: 110 },
    ],
  },
  {
    slug: "brisa-san-isidro",
    nombre: "Brisa San Isidro",
    zona: "San Isidro, GBA Norte",
    direccion: "Av. Centenario 800",
    descripcion:
      "Alojamiento tranquilo en San Isidro con jardín, cochera cerrada y habitaciones modernas.",
    rating: 4.4,
    telefono: "11-4000-1011",
    lat: -34.4708,
    lng: -58.5276,
    colorDesde: "#f9a8d4",
    colorHasta: "#c026d3",
    amenitiesGenerales: ["Cochera propia", "Jardín", "WiFi", "Seguridad 24h"],
    categorias: [
      cat(1, "Standard", "Habitación moderna con salida a jardín.", ["Aire acondicionado", "TV cable"], 5, [48000, 70000, 90000]),
      cat(2, "Suite Jacuzzi", "Hidromasaje con vista al jardín.", ["Jacuzzi", "Jardín interno", "Minibar"], 3, [72000, 102000, 128000]),
    ],
  },
  {
    slug: "cascada-lanus",
    nombre: "Cascada Lanús",
    zona: "Lanús, GBA Sur",
    direccion: "Av. Hipólito Yrigoyen 3300",
    descripcion:
      "Opción cómoda en Lanús con suites temáticas y buena disponibilidad todos los días.",
    rating: 4.0,
    telefono: "11-4000-1012",
    lat: -34.7066,
    lng: -58.3917,
    colorDesde: "#fb7185",
    colorHasta: "#be123c",
    amenitiesGenerales: ["Cochera propia", "Ingreso discreto", "WiFi"],
    categorias: [
      cat(1, "Standard", "Habitación prolija con cama king.", ["Aire acondicionado", "TV cable"], 6, [41000, 60000, 78000]),
      cat(2, "Suite Jacuzzi", "Hidromasaje y luces de ambiente.", ["Jacuzzi", "Cromoterapia"], 2, [62000, 89000, 114000]),
      cat(3, "Suite Temática", "Decoración especial con espejos.", ["Espejos", "Luces LED", "Cama redonda"], 2, [58000, 85000, 110000]),
    ],
    comentarios: [
      { nombre: "Nico", calificacion: 4, comentario: "Buena atención y el precio es razonable para la zona.", horasAtras: 75 },
    ],
  },
];

const hoteles: HotelSeed[] = [...hotelesBase, ...hotelesNuevos];

// Fotos de ejemplo (public/fotos): una portada distinta por hotel.
const FOTOS: Record<string, string> = {
  "luna-palermo|Standard": "dormitorio-8",
  "luna-palermo|Suite Jacuzzi": "jacuzzi-3",
  "luna-palermo|Premium": "dormitorio-3",
  "cielo-recoleta|Standard": "dormitorio-2",
  "cielo-recoleta|Suite Jacuzzi": "jacuzzi-2",
  "cielo-recoleta|Premium": "dormitorio-4",
  "aurora-almagro|Standard": "dormitorio-11",
  "aurora-almagro|Suite Temática": "jacuzzi-4",
  "aurora-almagro|Suite Jacuzzi": "jacuzzi-1",
  "tulipan-caballito|Standard": "dormitorio-12",
  "tulipan-caballito|Suite Jacuzzi": "jacuzzi-5",
  "tulipan-caballito|Premium": "dormitorio-1",
  "punto-rosa-avellaneda|Standard": "dormitorio-6",
  "punto-rosa-avellaneda|Premium": "dormitorio-5",
  "beso-quilmes|Standard": "dormitorio-7",
  "beso-quilmes|Suite Jacuzzi": "jacuzzi-3",
  "beso-quilmes|Suite Temática": "jacuzzi-4",
  "eclipse-vicente-lopez|Standard": "dormitorio-5",
  "eclipse-vicente-lopez|Suite Jacuzzi": "jacuzzi-1",
  "eclipse-vicente-lopez|Premium": "dormitorio-12",
  "sensacion-san-justo|Standard": "dormitorio-9",
  "sensacion-san-justo|Suite Temática": "jacuzzi-5",
  "sensacion-san-justo|Suite Jacuzzi": "jacuzzi-2",
  "terciopelo-flores|Standard": "dormitorio-1",
  "terciopelo-flores|Suite Jacuzzi": "jacuzzi-4",
  "terciopelo-flores|Premium": "dormitorio-2",
  "noche-dorada-belgrano|Standard": "dormitorio-10",
  "noche-dorada-belgrano|Suite Temática": "jacuzzi-5",
  "noche-dorada-belgrano|Premium": "dormitorio-6",
  "brisa-san-isidro|Standard": "dormitorio-4",
  "brisa-san-isidro|Suite Jacuzzi": "jacuzzi-2",
  "cascada-lanus|Standard": "dormitorio-3",
  "cascada-lanus|Suite Jacuzzi": "jacuzzi-1",
  "cascada-lanus|Suite Temática": "jacuzzi-3",
};
for (const h of hoteles) {
  for (const c of h.categorias) {
    const f = FOTOS[`${h.slug}|${c.nombre}`];
    if (f) c.foto = `/fotos/${f}.jpg`;
  }
}

function datosHotel(h: HotelSeed) {
  return {
    slug: h.slug,
    nombre: h.nombre,
    zona: h.zona,
    direccion: h.direccion,
    descripcion: h.descripcion,
    rating: h.rating,
    telefono: h.telefono,
    lat: h.lat,
    lng: h.lng,
    colorDesde: h.colorDesde,
    colorHasta: h.colorHasta,
    amenitiesGenerales: h.amenitiesGenerales,
    reglas: reglasDefault(),
    abierto: true,
  };
}

function datosCategoria(c: CategoriaSeed, orden: number) {
  return {
    nombre: c.nombre,
    descripcion: c.descripcion,
    amenities: c.amenities,
    foto: c.foto ?? null,
    orden,
    habitaciones: { create: habitaciones(c.piso, c.cantidad) },
    turnos: { create: turnos(...c.precios) },
  };
}

async function crearHotel(h: HotelSeed) {
  await prisma.hotel.create({
    data: {
      ...datosHotel(h),
      categorias: { create: h.categorias.map((c, i) => datosCategoria(c, i)) },
      comentarios: h.comentarios
        ? {
            create: h.comentarios.map((cm) => ({
              nombre: cm.nombre,
              calificacion: cm.calificacion,
              comentario: cm.comentario,
              creada: new Date(Date.now() - cm.horasAtras * 60 * 60 * 1000),
            })),
          }
        : undefined,
    },
  });
}

/**
 * Pone al día una base ya sembrada (npm run db:sync): actualiza precios y fotos,
 * agrega las categorías y los hoteles que falten. No toca habitaciones,
 * reservas ni comentarios de lo que ya existe.
 */
async function sincronizar() {
  for (const h of hoteles) {
    const existente = await prisma.hotel.findUnique({
      where: { slug: h.slug },
      include: { categorias: { include: { turnos: true } } },
    });
    if (!existente) {
      await crearHotel(h);
      console.log(`Creado: ${h.nombre}`);
      continue;
    }
    let orden = existente.categorias.length;
    for (const c of h.categorias) {
      const actual = existente.categorias.find((x) => x.nombre === c.nombre);
      if (!actual) {
        await prisma.categoria.create({ data: { hotelId: existente.id, ...datosCategoria(c, orden++) } });
        continue;
      }
      await prisma.categoria.update({ where: { id: actual.id }, data: { foto: c.foto ?? actual.foto } });
      for (const t of turnos(...c.precios)) {
        await prisma.turno.updateMany({
          where: { categoriaId: actual.id, horas: t.horas },
          data: { precio: t.precio },
        });
      }
    }
    console.log(`Actualizado: ${h.nombre}`);
  }
}

async function main() {
  if (process.argv.includes("--sync")) {
    await sincronizar();
    return;
  }

  const existentes = await prisma.hotel.count();
  if (existentes > 0) {
    console.log(`Ya hay ${existentes} hoteles en la base, no se vuelve a sembrar (usá --sync para actualizar).`);
    return;
  }

  for (const h of hoteles) {
    await crearHotel(h);
    console.log(`Sembrado: ${h.nombre}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
