"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { HotelConDisponibilidad, Reserva } from "@/lib/types";
import CategoriaAdminCard from "./CategoriaAdminCard";
import HotelInfoCard from "./HotelInfoCard";
import NuevaCategoriaForm from "./NuevaCategoriaForm";
import ReservasTable from "./ReservasTable";
import { IconAlert, IconLogout } from "../icons";

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
    <div className="mx-auto max-w-4xl px-3 pb-10 pt-4 sm:px-6 sm:pt-6">
      <div className="flex items-start justify-between gap-3 px-1">
        <div>
          <h1 className="font-display text-[2.4rem] font-extrabold leading-[0.92] sm:text-[3rem]">
            Panel del hotel
          </h1>
          <p className="mt-1.5 text-ink-2">Habitaciones, precios y turnos en tiempo real.</p>
        </div>
        <button
          onClick={cerrarSesion}
          disabled={cerrandoSesion}
          className="btn btn-ghost !min-h-11 shrink-0 !px-3.5 !text-base"
        >
          <IconLogout size={18} />
          Salir
        </button>
      </div>

      {error && (
        <div role="alert" className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-red-50 p-3.5 text-sm font-semibold text-red-700">
          <span className="flex gap-2">
            <IconAlert size={18} className="mt-0.5 shrink-0" />
            {error}
          </span>
          <button onClick={() => cargarDetalle()} className="btn btn-ghost !min-h-10 !text-base">
            Reintentar
          </button>
        </div>
      )}

      {!hotel && !error && (
        <div className="mt-5 space-y-3" aria-hidden="true">
          <div className="sign sign--ghost h-28" />
          <div className="sign sign--ghost h-64" />
        </div>
      )}

      {hotel && (
        <>
          <section
            className={`sign mt-5 px-6 py-5 [--r:1.5rem] ${hotel.abierto ? "" : "sign--ash"}`}
            data-glint={hotel.abierto ? "1" : undefined}
          >
            <div className="relative z-[3] flex flex-wrap items-center justify-between gap-4">
              <div className="min-w-0">
                <h2 className="font-display text-[2rem] font-extrabold leading-none">{hotel.nombre}</h2>
                <p className="mt-1 text-sm font-medium text-ink-2">{hotel.direccion}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={hotel.abierto}
                onClick={toggleAbierto}
                disabled={cambiandoEstado}
                className="flex items-center gap-3 rounded-full border border-line-strong bg-surface py-1.5 pl-4 pr-1.5 font-display text-lg font-bold text-ink shadow-[0_8px_18px_-12px_rgba(63,19,41,0.5)] transition active:scale-[0.97] disabled:opacity-60"
              >
                {hotel.abierto ? "Abierto" : "Cerrado"}
                <span
                  className={`relative h-9 w-16 rounded-full transition-colors duration-300 ${
                    hotel.abierto ? "bg-sheet" : "bg-neutral-300"
                  }`}
                >
                  <span
                    className={`absolute left-1 top-1 h-7 w-7 rounded-full bg-white shadow-[0_2px_5px_rgba(63,19,41,0.4)] transition-transform duration-[320ms] [transition-timing-function:var(--ease-out)] ${
                      hotel.abierto ? "translate-x-7" : "translate-x-0"
                    }`}
                  />
                </span>
              </button>
            </div>
          </section>

          <div className="mt-4">
            <HotelInfoCard hotel={hotel} onGuardado={cargarDetalle} />
          </div>

          <h2 className="mb-3 mt-10 font-display text-[2rem] font-extrabold leading-none">
            Categorías y disponibilidad
          </h2>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {hotel.categorias.map((cat) => (
              <CategoriaAdminCard
                key={cat.id}
                hotelId={hotel.id}
                categoria={cat}
                onGuardado={cargarDetalle}
                onEliminada={cargarDetalle}
              />
            ))}
          </div>

          <div className="mt-4">
            <NuevaCategoriaForm hotelId={hotel.id} onCreada={cargarDetalle} />
          </div>

          <h2 className="mb-3 mt-10 font-display text-[2rem] font-extrabold leading-none">
            Reservas activas
          </h2>
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
