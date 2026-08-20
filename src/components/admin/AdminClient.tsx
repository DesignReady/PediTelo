"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { HotelConDisponibilidad, Reserva } from "@/lib/types";
import CategoriaAdminCard from "./CategoriaAdminCard";
import HotelInfoCard from "./HotelInfoCard";
import ReservasTable from "./ReservasTable";

interface HotelResumen {
  id: string;
  slug: string;
  nombre: string;
  zona: string;
}

export default function AdminClient() {
  const [hoteles, setHoteles] = useState<HotelResumen[]>([]);
  const [hotelId, setHotelId] = useState<string>("");
  const [hotel, setHotel] = useState<HotelConDisponibilidad | null>(null);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [cambiandoEstado, setCambiandoEstado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cargandoLista, setCargandoLista] = useState(true);

  const requestSeq = useRef(0);

  const cargarHoteles = useCallback(async () => {
    setCargandoLista(true);
    try {
      const res = await fetch("/api/admin/hotels");
      if (!res.ok) throw new Error(`Error del servidor (${res.status})`);
      const data = await res.json();
      setHoteles(data.hotels ?? []);
      if (data.hotels?.length) setHotelId((prev) => prev || data.hotels[0].id);
      setError(null);
    } catch {
      setError("No pudimos cargar los hoteles. Revisá tu conexión e intentá de nuevo.");
    } finally {
      setCargandoLista(false);
    }
  }, []);

  useEffect(() => {
    cargarHoteles();
  }, [cargarHoteles]);

  // Cada llamada lleva un número de secuencia: si una respuesta más vieja llega
  // después de una más nueva (por ejemplo el polling automático superpuesto con
  // una acción manual como abrir/cerrar), la descartamos para no "pisar" el
  // cambio más reciente que ya se ve en pantalla.
  const cargarDetalle = useCallback(async () => {
    if (!hotelId) return;
    const seq = ++requestSeq.current;
    try {
      const res = await fetch(`/api/admin/hotels/${hotelId}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Error del servidor (${res.status})`);
      const data = await res.json();
      if (seq !== requestSeq.current) return;
      setHotel(data.hotel);
      setReservas(data.reservas ?? []);
      setError(null);
    } catch {
      if (seq !== requestSeq.current) return;
      setError("No pudimos cargar este hotel. Revisá tu conexión e intentá de nuevo.");
    }
  }, [hotelId]);

  useEffect(() => {
    setHotel(null);
    if (hotelId) cargarDetalle();
    const interval = setInterval(cargarDetalle, 15000);
    return () => clearInterval(interval);
  }, [cargarDetalle, hotelId]);

  async function toggleAbierto() {
    if (!hotel) return;
    setCambiandoEstado(true);
    const nuevoEstado = !hotel.abierto;
    setHotel({ ...hotel, abierto: nuevoEstado });
    try {
      const res = await fetch(`/api/admin/hotels/${hotel.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ abierto: nuevoEstado }),
      });
      if (!res.ok) throw new Error("No se pudo actualizar");
      await cargarDetalle();
    } finally {
      setCambiandoEstado(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="text-xl font-extrabold text-neutral-800 sm:text-2xl">
        Panel de administrador
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        Versión demo sin contraseña: elegí el alojamiento que estás administrando y
        actualizá habitaciones, precios y turnos en tiempo real.
      </p>

      {error && (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <span>{error}</span>
          <button
            onClick={() => (hoteles.length ? cargarDetalle() : cargarHoteles())}
            className="shrink-0 rounded-lg border border-red-300 px-2.5 py-1 text-xs font-semibold"
          >
            Reintentar
          </button>
        </div>
      )}

      {!error && cargandoLista && hoteles.length === 0 && (
        <p className="mt-4 text-sm text-neutral-400">Cargando hoteles…</p>
      )}

      {hoteles.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <label className="text-sm font-medium text-neutral-700">
            Estás administrando:
          </label>
          <select
            value={hotelId}
            onChange={(e) => setHotelId(e.target.value)}
            className="rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none"
          >
            {hoteles.map((h) => (
              <option key={h.id} value={h.id}>
                {h.nombre} — {h.zona}
              </option>
            ))}
          </select>
        </div>
      )}

      {hotel && (
        <>
          <div className="mt-4 flex items-center justify-between rounded-2xl border border-pink-100 bg-white p-4 shadow-sm">
            <div>
              <p className="text-sm font-semibold text-neutral-800">{hotel.nombre}</p>
              <p className="text-xs text-neutral-500">{hotel.direccion}</p>
            </div>
            <button
              onClick={toggleAbierto}
              disabled={cambiandoEstado}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition disabled:opacity-60 ${
                hotel.abierto
                  ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
              }`}
            >
              {hotel.abierto ? "Abierto — tocar para cerrar" : "Cerrado — tocar para abrir"}
            </button>
          </div>

          <div className="mt-4">
            <HotelInfoCard hotel={hotel} onGuardado={cargarDetalle} />
          </div>

          <h2 className="mt-8 mb-3 text-lg font-bold text-neutral-800">
            Categorías y disponibilidad
          </h2>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {hotel.categorias.map((cat) => (
              <CategoriaAdminCard
                key={cat.id}
                hotelId={hotel.id}
                categoria={cat}
                onGuardado={cargarDetalle}
              />
            ))}
          </div>

          <h2 className="mt-8 mb-3 text-lg font-bold text-neutral-800">Reservas activas</h2>
          <ReservasTable
            reservas={reservas}
            categoriaNombre={(id) =>
              hotel.categorias.find((c) => c.id === id)?.nombre ?? "—"
            }
            onCambio={cargarDetalle}
          />
        </>
      )}
    </div>
  );
}
