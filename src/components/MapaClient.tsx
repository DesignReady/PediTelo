"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { HotelConDisponibilidad } from "@/lib/types";
import { useGeolocation } from "@/lib/useGeolocation";
import { distanciaKm, formatDistancia } from "@/lib/geo";
import { IconArrow, IconLocate, IconWifiOff } from "./icons";

const LeafletMap = dynamic(() => import("@/components/LeafletMap"), {
  ssr: false,
  loading: () => <div className="sign--ghost sign h-full w-full !rounded-none" aria-label="Cargando mapa" />,
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
    <div className="mx-auto max-w-6xl px-3 pt-3 sm:px-6 sm:pt-5">
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2 px-1 pb-3">
        <div>
          <h1 className="font-display text-[2.4rem] font-extrabold leading-none sm:text-[3rem]">
            Mapa en vivo
          </h1>
          <p className="mt-1.5 flex items-center gap-2 text-sm font-semibold text-ink-2">
            <span className="inline-block h-3.5 w-3.5 rotate-45 rounded-[4px] border-2 border-surface bg-sheet shadow-[0_1px_4px_rgba(63,19,41,0.5)]" aria-hidden="true" />
            Rosa: hay lugar ahora
            <span className="ml-2 inline-block h-3.5 w-3.5 rotate-45 rounded-[4px] border-2 border-surface bg-ash shadow-[0_1px_4px_rgba(63,19,41,0.5)]" aria-hidden="true" />
            Gris: lleno o cerrado
          </p>
        </div>
        {estado !== "listo" && (
          <button onClick={solicitar} disabled={estado === "buscando"} className="btn btn-primary !min-h-11 !text-base">
            <IconLocate size={18} />
            {estado === "buscando" ? "Buscando tu ubicación…" : "Activar mi ubicación"}
          </button>
        )}
      </div>

      {error ? (
        <div role="alert" className="panel flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center">
          <IconWifiOff size={28} className="shrink-0 text-pink-text" />
          <p className="flex-1 font-semibold">{error}</p>
          <button
            onClick={() => {
              setLoading(true);
              cargar();
            }}
            className="btn btn-primary"
          >
            Reintentar
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="relative h-[58vh] min-h-[320px] shrink-0 overflow-hidden rounded-[1.75rem] border-2 border-line-strong shadow-[var(--shadow-soft)] lg:h-[74vh] lg:flex-1">
            {loading ? (
              <div className="sign--ghost sign h-full w-full !rounded-none" aria-label="Cargando" />
            ) : (
              <LeafletMap hotels={puntos} userCoords={coords} />
            )}
          </div>

          {cercanos.length > 0 && (
            <aside className="lg:w-80 lg:shrink-0" aria-labelledby="titulo-cercanos">
              <h2 id="titulo-cercanos" className="mb-2.5 px-1 font-display text-[1.6rem] font-extrabold leading-none">
                Más cerca tuyo
              </h2>
              <div className="space-y-2.5">
                {cercanos.map(({ hotel, km }, i) => {
                  const libre = hotel.abierto && hotel.totalDisponibles > 0;
                  return (
                    <Link
                      key={hotel.id}
                      href={`/hotel/${hotel.slug}`}
                      className={`sign sign-link sign-in group flex items-center gap-3 px-5 py-3.5 [--r:1.1rem] active:scale-[0.98] ${
                        libre ? "" : "sign--ash"
                      }`}
                      style={{ ["--i" as string]: i } as React.CSSProperties}
                    >
                      <div className="relative z-[3] min-w-0 flex-1">
                        <p className="truncate font-display text-[1.35rem] font-extrabold leading-tight">
                          {hotel.nombre}
                        </p>
                        <p className="text-sm font-semibold text-ink-2">
                          {libre ? `${hotel.totalDisponibles} libres ahora` : hotel.abierto ? "Lleno" : "Cerrado"}
                        </p>
                      </div>
                      <span className="relative z-[3] shrink-0 font-display text-xl font-extrabold tabular-nums">
                        {formatDistancia(km)}
                      </span>
                      <IconArrow size={20} className="relative z-[3] shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  );
                })}
              </div>
            </aside>
          )}
        </div>
      )}
    </div>
  );
}
