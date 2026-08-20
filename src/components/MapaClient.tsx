"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { HotelConDisponibilidad } from "@/lib/types";
import { useGeolocation } from "@/lib/useGeolocation";
import { distanciaKm, formatDistancia } from "@/lib/geo";

const LeafletMap = dynamic(() => import("@/components/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-neutral-400">
      Cargando mapa…
    </div>
  ),
});

export default function MapaClient() {
  const [hotels, setHotels] = useState<HotelConDisponibilidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { coords, estado, solicitar } = useGeolocation();

  const cargar = useCallback(async () => {
    try {
      const res = await fetch("/api/hotels?disponible=false", { cache: "no-store" });
      if (!res.ok) throw new Error(`Error del servidor (${res.status})`);
      const data = await res.json();
      setHotels(data.hotels ?? []);
      setError(null);
    } catch {
      setError("No pudimos cargar el mapa. Revisá tu conexión e intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  useEffect(() => {
    solicitar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const puntos = useMemo(
    () =>
      hotels.map((h) => ({
        slug: h.slug,
        nombre: h.nombre,
        lat: h.lat,
        lng: h.lng,
        precioDesde: h.precioDesde,
        totalDisponibles: h.totalDisponibles,
        abierto: h.abierto,
      })),
    [hotels]
  );

  const cercanos = useMemo(() => {
    if (!coords) return [];
    return hotels
      .map((h) => ({ hotel: h, km: distanciaKm(coords, { lat: h.lat, lng: h.lng }) }))
      .sort((a, b) => a.km - b.km)
      .slice(0, 6);
  }, [hotels, coords]);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="border-b border-pink-100 bg-white px-4 py-3 sm:px-6">
        <h1 className="text-base font-bold text-neutral-800 sm:text-lg">
          Mapa de disponibilidad
        </h1>
        {estado !== "listo" ? (
          <button onClick={solicitar} className="mt-1 text-xs font-semibold text-pink-600">
            {estado === "buscando" ? "Buscando tu ubicación…" : "📍 Activar mi ubicación"}
          </button>
        ) : (
          <p className="mt-1 text-xs text-neutral-400">
            Los puntos rosas tienen habitaciones libres ahora mismo.
          </p>
        )}
      </div>

      {error ? (
        <div className="m-4 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <span>{error}</span>
          <button
            onClick={() => {
              setLoading(true);
              cargar();
            }}
            className="shrink-0 rounded-lg border border-red-300 px-2.5 py-1 text-xs font-semibold"
          >
            Reintentar
          </button>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row">
          <div className="relative h-[60vh] shrink-0 sm:h-[75vh] sm:flex-1">
            {loading ? (
              <div className="flex h-full items-center justify-center text-sm text-neutral-400">
                Cargando…
              </div>
            ) : (
              <LeafletMap hotels={puntos} userCoords={coords} />
            )}
          </div>

          {cercanos.length > 0 && (
            <div className="px-4 py-3 sm:w-72 sm:shrink-0 sm:overflow-y-auto sm:border-l sm:border-pink-100 sm:px-4 sm:py-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                Más cerca tuyo
              </p>
              <div className="space-y-2">
                {cercanos.map(({ hotel, km }) => (
                  <Link
                    key={hotel.id}
                    href={`/hotel/${hotel.slug}`}
                    className="flex items-center justify-between rounded-xl border border-pink-100 bg-white px-3 py-2.5 shadow-sm transition active:bg-pink-50 sm:hover:bg-pink-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-neutral-800">
                        {hotel.nombre}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {hotel.abierto && hotel.totalDisponibles > 0
                          ? `${hotel.totalDisponibles} libres ahora`
                          : "Sin disponibilidad"}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-pink-50 px-2.5 py-1 text-xs font-semibold text-pink-700">
                      {formatDistancia(km)}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
