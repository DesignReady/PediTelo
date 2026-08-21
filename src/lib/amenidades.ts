export interface AmenidadOpcion {
  nombre: string;
  icon: string;
}

/** Lista curada de servicios comunes para elegir rápido desde el admin. */
export const AMENIDADES_COMUNES: AmenidadOpcion[] = [
  { nombre: "WiFi", icon: "📶" },
  { nombre: "Aire acondicionado", icon: "❄️" },
  { nombre: "Jacuzzi", icon: "🛁" },
  { nombre: "TV cable", icon: "📺" },
  { nombre: "Frigobar", icon: "🧊" },
  { nombre: "Minibar", icon: "🍾" },
  { nombre: "Cama redonda", icon: "🛏️" },
  { nombre: "Sillón", icon: "🛋️" },
  { nombre: "Sonido bluetooth", icon: "🔊" },
  { nombre: "Parlantes", icon: "🔊" },
  { nombre: "Servicios de streaming", icon: "🎬" },
  { nombre: "Barra para bailar", icon: "💃" },
  { nombre: "Vista panorámica", icon: "🌆" },
  { nombre: "Cochera propia", icon: "🅿️" },
  { nombre: "Ingreso discreto", icon: "🚪" },
  { nombre: "Seguridad 24h", icon: "🛡️" },
  { nombre: "Room service", icon: "🛎️" },
  { nombre: "Cromoterapia", icon: "🌈" },
];
