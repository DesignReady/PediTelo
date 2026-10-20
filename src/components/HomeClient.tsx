"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HotelConDisponibilidad } from "@/lib/types";
import { AmenidadOpcion } from "@/lib/amenidades";
import HotelCard from "./HotelCard";
import PriceRangeSlider from "./PriceRangeSlider";
import ServiciosDropdown from "./ServiciosDropdown";
import Digits from "./Digits";
import { IconCheck, IconChevron, IconClose, IconLocate, IconWifiOff } from "./icons";
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";

  const [hotels, setHotels] = useState<HotelConDisponibilidad[]>([]);
  const [zonas, setZonas] = useState<string[]>([]);
  const [libresAhora, setLibresAhora] = useState<number | null>(null);
  const [soloDisponibles, setSoloDisponibles] = useState(false);
  const [zona, setZona] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);

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
    if (q) params.set("q", q);

    try {
      const res = await fetch(`/api/hotels?${params.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Error del servidor (${res.status})`);
      const data = await res.json();
      setHotels(data.hotels ?? []);
      setZonas(data.zonas ?? []);
      if (typeof data.libresAhora === "number") setLibresAhora(data.libresAhora);
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
  }, [soloDisponibles, zona, precioAplicado, servicios, q]);

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

  const precioModificado =
    !!rango && !!precioSel && (precioSel.min !== rango.min || precioSel.max !== rango.max);
  const filtrosActivos = (zona ? 1 : 0) + (precioModificado ? 1 : 0) + (servicios.length > 0 ? 1 : 0);

  function limpiarTodo() {
    setZona("");
    setServicios([]);
    setSoloDisponibles(false);
    if (rango) {
      setPrecioSel(rango);
      setPrecioAplicado(rango);
    }
    if (q) router.push("/");
  }

  return (
    <div>
      {/* ───── Cartel principal ───── */}
      <section className="px-3 pt-3 sm:px-6 sm:pt-5">
        <div
          className="sign mx-auto max-w-6xl px-6 pb-8 pt-8 [--r:2rem] sm:px-12 sm:pb-12 sm:pt-12"
          data-glint="1"
        >
          <div className="lg:flex lg:items-end lg:justify-between lg:gap-14">
            <div className="lg:max-w-[34rem]">
              <h1 className="max-w-[16ch] font-display text-[clamp(2.2rem,8.6vw,4.4rem)] font-extrabold leading-[1.02]">
                Dejá de dar vueltas de <span className="text-pink-text">madrugada</span>
              </h1>

              <div className="mt-5 flex flex-wrap items-center gap-3 sm:mt-7">
                <button
                  type="button"
                  onClick={solicitar}
                  disabled={estado === "buscando"}
                  className="btn btn-primary"
                >
                  {estado === "listo" ? <IconCheck size={20} /> : <IconLocate size={20} />}
                  {estado === "listo"
                    ? "Ordenado por cercanía"
                    : estado === "buscando"
                    ? "Buscando tu ubicación…"
                    : "Los más cerca mío"}
                </button>
                {estado === "denegado" && (
                  <p className="max-w-[22ch] text-sm font-semibold leading-tight text-ink-2">
                    Activá la ubicación en el navegador para ordenar por cercanía.
                  </p>
                )}
              </div>
            </div>

            {libresAhora !== null && (
              <div className="mt-6 flex items-end gap-4 lg:mt-0">
                <Digits
                  value={libresAhora}
                  ignite
                  className="text-[4rem] text-pink-text sm:text-[5rem] lg:text-[6.5rem]"
                  label={`${libresAhora} habitaciones libres ahora`}
                />
                <div className="pb-1.5 sm:pb-3 lg:pb-5">
                  <p className="font-display text-[1.3rem] font-bold leading-tight sm:text-[1.6rem]">
                    habitaciones
                    <br />
                    libres ahora
                  </p>
                  <p className="mt-1.5 flex items-center gap-2 text-sm font-semibold text-ink-2">
                    <span className="live-dot" aria-hidden="true" />
                    En vivo, se actualiza solo
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ───── Filtros ───── */}
      <section aria-label="Filtros" className="mx-auto mt-5 max-w-6xl px-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="chip !min-h-11 !px-4 !text-[0.95rem]"
            aria-pressed={soloDisponibles}
            onClick={() => setSoloDisponibles((v) => !v)}
          >
            <span
              aria-hidden="true"
              className={`h-2.5 w-2.5 rounded-full ${soloDisponibles ? "bg-white" : "bg-sheet"}`}
            />
            Solo con lugar ahora
          </button>

          <button
            type="button"
            className="chip !min-h-11 !px-4 !text-[0.95rem]"
            aria-expanded={filtrosAbiertos}
            aria-controls="panel-filtros"
            data-on={filtrosAbiertos || filtrosActivos > 0 ? "true" : undefined}
            onClick={() => setFiltrosAbiertos((v) => !v)}
          >
            Filtros
            {filtrosActivos > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-xs font-extrabold text-sheet-deep">
                {filtrosActivos}
              </span>
            )}
            <IconChevron
              size={16}
              className={`transition-transform duration-300 ${filtrosAbiertos ? "rotate-180" : ""}`}
            />
          </button>

          {q && (
            <span className="chip !min-h-11 !border-sheet !pl-4 !pr-1.5 !text-[0.95rem] !text-pink-text">
              “{q}”
              <button
                type="button"
                onClick={() => router.push("/")}
                aria-label="Quitar búsqueda por nombre"
                className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-surface-2"
              >
                <IconClose size={14} />
              </button>
            </span>
          )}
        </div>

        <div id="panel-filtros" className="fold" data-open={filtrosAbiertos}>
          <div className="fold-inner" inert={!filtrosAbiertos}>
            <div className="panel mt-3 grid gap-5 p-4 sm:grid-cols-2 sm:p-5">
              <div>
                <label htmlFor="filtro-zona" className="mb-1.5 block text-sm font-bold text-ink-2">
                  Barrio
                </label>
                <select
                  id="filtro-zona"
                  value={zona}
                  onChange={(e) => setZona(e.target.value)}
                  className="field"
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
                <span id="filtro-precio-label" className="mb-1.5 block text-sm font-bold text-ink-2">
                  Precio por turno
                </span>
                {rango && precioSel ? (
                  <div role="group" aria-labelledby="filtro-precio-label" className="px-1">
                    <PriceRangeSlider
                      min={rango.min}
                      max={rango.max}
                      valueMin={precioSel.min}
                      valueMax={precioSel.max}
                      onChange={(min, max) => setPrecioSel({ min, max })}
                    />
                  </div>
                ) : (
                  <div className="sign--ghost sign h-11 rounded-xl" />
                )}
              </div>

              <div className="sm:col-span-2">
                <span className="mb-1.5 block text-sm font-bold text-ink-2">Servicios</span>
                <ServiciosDropdown
                  items={servicios}
                  onChange={setServicios}
                  opciones={SERVICIOS_FILTRO}
                  placeholderVacio="Cualquier servicio"
                  permitirPersonalizado={false}
                />
              </div>

              {filtrosActivos > 0 && (
                <div className="sm:col-span-2">
                  <button type="button" onClick={limpiarTodo} className="btn btn-quiet">
                    Limpiar filtros
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ───── Resultados ───── */}
      <section className="mx-auto mt-5 max-w-6xl px-3 pb-4 sm:px-6" aria-live="polite">
        <div className="mb-3 flex items-baseline justify-between gap-3 px-1">
          <h2 className="font-display text-[1.6rem] font-bold leading-none tracking-wide">
            Salidas cercanas
          </h2>
          <p className="text-sm font-semibold text-ink-3">
            {loading
              ? "Buscando disponibilidad…"
              : `${hotels.length} alojamiento${hotels.length === 1 ? "" : "s"}`}
          </p>
        </div>

        {error && (
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
        )}

        {loading && hotels.length === 0 && !error && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="sign sign--ghost h-[11.5rem]" />
            ))}
          </div>
        )}

        {!loading && !error && hotels.length === 0 && (
          <div className="panel px-5 py-10 text-center">
            <p className="font-display text-2xl font-bold">Ninguna salida con esos filtros</p>
            <p className="mx-auto mt-1 max-w-sm text-ink-2">
              Probá ampliar el precio o sacar un servicio.
            </p>
            <button type="button" onClick={limpiarTodo} className="btn btn-primary mt-5">
              Ver todos
            </button>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {hotelesOrdenados.map(({ hotel, km }, i) => (
            <HotelCard key={hotel.id} hotel={hotel} distanciaKm={km} indice={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
