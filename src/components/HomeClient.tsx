"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { HotelConDisponibilidad } from "@/lib/types";
import { AmenidadOpcion } from "@/lib/amenidades";
import HotelCard from "./HotelCard";
import PriceRangeSlider from "./PriceRangeSlider";
import ServiciosDropdown from "./ServiciosDropdown";
import { useGeolocation } from "@/lib/useGeolocation";
import { distanciaKm } from "@/lib/geo";

// Términos genéricos a propósito (ej. "Cochera" en vez de "Cochera propia")
// para que el filtro haga match con cualquier variante que haya cargado cada hotel.
const SERVICIOS_FILTRO: AmenidadOpcion[] = [
  { nombre: "Sillón", icon: "🛋️" },
  { nombre: "Jacuzzi", icon: "🛁" },
  { nombre: "Barra para bailar", icon: "💃" },
  { nombre: "WiFi", icon: "📶" },
  { nombre: "Parlantes", icon: "🔊" },
  { nombre: "Servicios de streaming", icon: "📺" },
  { nombre: "Aire acondicionado", icon: "❄️" },
  { nombre: "Cochera", icon: "🅿️" },
];

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
  const [servicios, setServicios] = useState<string[]>([]);

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
    if (servicios.length > 0) params.set("servicios", servicios.join(","));

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
  }, [soloDisponibles, zona, precioAplicado, servicios]);

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
        <div className="space-y-4 rounded-2xl border border-pink-100 bg-white p-4 shadow-sm">
          <label
            htmlFor="filtro-disponible"
            className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-neutral-700"
          >
            <input
              id="filtro-disponible"
              type="checkbox"
              checked={soloDisponibles}
              onChange={(e) => setSoloDisponibles(e.target.checked)}
              className="h-4 w-4 shrink-0 accent-pink-600"
            />
            Buscar solo lugares abiertos y con disponibilidad ahora
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="filtro-zona"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-400"
              >
                Barrio
              </label>
              <select
                id="filtro-zona"
                value={zona}
                onChange={(e) => setZona(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-700 focus:border-pink-400 focus:outline-none"
              >
                <option value="">Todos los barrios</option>
                {zonas.map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span
                id="filtro-precio-label"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-400"
              >
                Precio por turno
              </span>
              {rango && precioSel ? (
                <div
                  role="group"
                  aria-labelledby="filtro-precio-label"
                  className="rounded-lg border border-neutral-200 px-3 py-2.5"
                >
                  <PriceRangeSlider
                    min={rango.min}
                    max={rango.max}
                    valueMin={precioSel.min}
                    valueMax={precioSel.max}
                    onChange={(min, max) => setPrecioSel({ min, max })}
                  />
                </div>
              ) : (
                <div className="rounded-lg border border-neutral-200 px-3 py-2.5 text-sm text-neutral-300">
                  Cargando…
                </div>
              )}
            </div>
          </div>

          <div>
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-400">
              Servicios
            </span>
            <ServiciosDropdown
              items={servicios}
              onChange={setServicios}
              opciones={SERVICIOS_FILTRO}
              placeholderVacio="Cualquier servicio"
              permitirPersonalizado={false}
            />
          </div>
        </div>

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
