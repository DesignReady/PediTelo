export interface Coords {
  lat: number;
  lng: number;
}

/** Distancia en km entre dos coordenadas (fórmula de Haversine). */
export function distanciaKm(a: Coords, b: Coords): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;

  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function formatDistancia(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export function urlGoogleMaps(destino: Coords): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${destino.lat},${destino.lng}`;
}

export function urlWaze(destino: Coords): string {
  return `https://waze.com/ul?ll=${destino.lat},${destino.lng}&navigate=yes`;
}
