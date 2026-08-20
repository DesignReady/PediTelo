"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { HotelConDisponibilidad } from "@/lib/types";
import HotelCard from "./HotelCard";
import PriceRangeSlider from "./PriceRangeSlider";
import { useGeolocation } from "@/lib/useGeolocation";
import { distanciaKm } from "@/lib/geo";

export default function HomeClient() {
  const [hotels, setHotels] = useState<HotelConDisponibilidad[]>([]);
  const [zonas, setZonas] = useState<string[]>([]);
  const [soloDisponibles, setSoloDisponibles] = useState(true);
  const [zona, setZona] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [rango, setRango] = useState<{ min: number; max: number } | null>(null);
  const [precioSel, setPrecioSel] = useState<{ min: number; max: number } | null>(null);
  const [precioAplicado, setPrecioAplicado] = useState<{ min: number; max: number } | null>(null);
  const [mostrarFiltroPrecio, setMostrarFiltroPrecio] = useState(false);

  const { coords, estado, solicitar } = useGeolocation();

  useEffect(() => {
    if (!precioSel) return;
    const t = setTimeout(() => setPrecioAplicado(precioSel), 350);
    return () => clearTimeout(t);
  }, [precioSel]);

  const cargar = useCallback(async () => {
    const params = new URLSearchParams();
    params.set("disponible", String(soloDisponibles));
    if (zona) params.set("zona", zona);
    if (precioAplicado) {
      params.set("precioMin", String(precioAplicado.min));
      params.set("precioMax", String(precioAplicado.max));
    }

    try {
      const res = await fetch(`/api/hotels?${params.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Error del servidor (${res.status})`);
      const data = await res.json();
      setHotels(data.hotels ?? []);
      setZonas(data.zonas ?? []);
      if (data.rangoPrecios) {
        setRango(data.rangoPrecios);
        setPrecioSel((prev) => prev ?? data.rangoPrecios);
        setPrecioAplicado((prev) => prev ?? data.rangoPrecios);
      }
      setError(null);
    } catch {
      setError("No pudimos cargar los alojamientos. Revisá tu conexión e intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }, [soloDisponibles, zona, precioAplicado]);

  useEffect(() => {
    setLoading(true);
    cargar();
    const interval = setInterval(cargar, 20000);
    return () => clearInterval(interval);
  }, [cargar]);

  const hotelesOrdenados = useMemo(() => {
    if (!coords) return hotels.map((h) => ({ hotel: h, km: undefined as number | undefined }));
    return hotels
      .map((h) => ({ hotel: h, km: distanciaKm(coords, { lat: h.lat, lng: h.lng }) }))
      .sort((a, b) => a.km - b.km);
  }, [hotels, coords]);

  return (
    <div>
      <section className="bg-gradient-to-br from-pink-600 via-rose-600 to-pink-700 text-white">
        <div className="mx-auto max-w-3xl px-4 pb-6 pt-6 sm:px-6 sm:pb-10 sm:pt-14">
          <h1 className="text-2xl font-extrabold leading-tight sm:text-4xl">
            Dejá de dar vueltas de madrugada.
          </h1>
          <p className="mt-1.5 text-sm text-pink-50/90 sm:mt-3 sm:text-base">
            Disponibilidad real ahora mismo. Reservá tu turno en segundos.
          </p>

          <button
            onClick={solicitar}
            disabled={estado === "buscando"}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white/15 py-2.5 text-sm font-semibold backdrop-blur transition active:bg-white/25 disabled:opacity-70 sm:w-auto sm:px-6"
          >
            {estado === "listo"
              ? "📍 Ordenado por cercanía"
              : estado === "buscando"
              ? "Buscando tu ubicación…"
              : estado === "denegado"
              ? "Ubicación no disponible — activala en el navegador"
              : "📍 Buscar hoteles cerca tuyo"}
          </button>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-4 sm:px-6 sm:py-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap sm:overflow-visible [&::-webkit-scrollbar]:hidden">
          <button
            onClick={() => setSoloDisponibles((v) => !v)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition sm:text-sm ${
              soloDisponibles
                ? "border-pink-500 bg-pink-500 text-white"
                : "border-neutral-200 bg-white text-neutral-500"
            }`}
          >
            Disponible ahora
          </button>
          <button
            onClick={() => setZona("")}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition sm:text-sm ${
              zona === ""
                ? "border-pink-500 bg-pink-500 text-white"
                : "border-neutral-200 bg-white text-neutral-500"
            }`}
          >
            Todas las zonas
          </button>
          {zonas.map((z) => (
            <button
              key={z}
              onClick={() => setZona(z)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition sm:text-sm ${
                zona === z
                  ? "border-pink-500 bg-pink-500 text-white"
                  : "border-neutral-200 bg-white text-neutral-500"
              }`}
            >
              {z}
            </button>
          ))}
          <button
            onClick={() => setMostrarFiltroPrecio((v) => !v)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition sm:text-sm ${
              mostrarFiltroPrecio
                ? "border-pink-500 bg-pink-500 text-white"
                : "border-neutral-200 bg-white text-neutral-500"
            }`}
          >
            💲 Precio
          </button>
        </div>

        {mostrarFiltroPrecio && rango && precioSel && (
          <div className="mt-3 rounded-xl border border-pink-100 bg-white p-3 sm:max-w-xs">
            <PriceRangeSlider
              min={rango.min}
              max={rango.max}
              valueMin={precioSel.min}
              valueMax={precioSel.max}
              onChange={(min, max) => setPrecioSel({ min, max })}
            />
          </div>
        )}

        <div className="mt-3 flex items-center justify-between text-xs text-neutral-400">
          <span>
            {loading
              ? "Buscando disponibilidad…"
              : `${hotels.length} alojamiento${hotels.length === 1 ? "" : "s"}`}
          </span>
        </div>

        {error && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
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
        )}

        {!loading && !error && hotels.length === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed border-pink-200 bg-pink-50/50 p-8 text-center text-sm text-neutral-500">
            No encontramos alojamientos con esos filtros. Probá ampliando la búsqueda.
          </div>
        )}

        <div className="mt-3 space-y-2.5">
          {hotelesOrdenados.map(({ hotel, km }) => (
            <HotelCard key={hotel.id} hotel={hotel} distanciaKm={km} />
          ))}
        </div>
      </section>
    </div>
  );
}
