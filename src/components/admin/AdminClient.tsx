"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { HotelConDisponibilidad, Reserva } from "@/lib/types";
import CategoriaAdminCard from "./CategoriaAdminCard";
import HotelInfoCard from "./HotelInfoCard";
import ReservasTable from "./ReservasTable";

export default function AdminClient({ hotelId }: { hotelId: string }) {
  const router = useRouter();
  const [hotel, setHotel] = useState<HotelConDisponibilidad | null>(null);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [cambiandoEstado, setCambiandoEstado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cerrandoSesion, setCerrandoSesion] = useState(false);

  const requestSeq = useRef(0);

  // Cada llamada lleva un número de secuencia: si una respuesta más vieja llega
  // después de una más nueva (por ejemplo el polling automático superpuesto con
  // una acción manual como abrir/cerrar), la descartamos para no "pisar" el
  // cambio más reciente que ya se ve en pantalla.
  const cargarDetalle = useCallback(async () => {
    const seq = ++requestSeq.current;
    try {
      const res = await fetch(`/api/admin/hotels/${hotelId}`, { cache: "no-store" });
      if (res.status === 401 || res.status === 403) {
        router.push("/admin/login");
        return;
      }
      if (!res.ok) throw new Error(`Error del servidor (${res.status})`);
      const data = await res.json();
      if (seq !== requestSeq.current) return;
      setHotel(data.hotel);
      setReservas(data.reservas ?? []);
      setError(null);
    } catch {
      if (seq !== requestSeq.current) return;
      setError("No pudimos cargar tu hotel. Revisá tu conexión e intentá de nuevo.");
    }
  }, [hotelId, router]);

  useEffect(() => {
    cargarDetalle();
    const interval = setInterval(cargarDetalle, 15000);
    return () => clearInterval(interval);
  }, [cargarDetalle]);

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

  async function cerrarSesion() {
    setCerrandoSesion(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } finally {
      setCerrandoSesion(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-neutral-800 sm:text-2xl">
            Panel de administrador
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Actualizá habitaciones, precios y turnos de tu hotel en tiempo real.
          </p>
        </div>
        <button
          onClick={cerrarSesion}
          disabled={cerrandoSesion}
          className="shrink-0 rounded-lg border border-neutral-200 px-3 py-2 text-xs font-semibold text-neutral-500 hover:bg-neutral-50 disabled:opacity-60"
        >
          Cerrar sesión
        </button>
      </div>

      {error && (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <span>{error}</span>
          <button
            onClick={() => cargarDetalle()}
            className="shrink-0 rounded-lg border border-red-300 px-2.5 py-1 text-xs font-semibold"
          >
            Reintentar
          </button>
        </div>
      )}

      {!hotel && !error && (
        <p className="mt-4 text-sm text-neutral-400">Cargando…</p>
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
