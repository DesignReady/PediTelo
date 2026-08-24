"use client";

import { useEffect, useState } from "react";
import { CategoriaConDisponibilidad, TurnoHoras, UsuarioSesion } from "@/lib/types";
import { formatARS, formatHora } from "@/lib/format";
import GoogleLoginButton from "./GoogleLoginButton";

interface ReservaConfirmada {
  codigo: string;
  inicio: string;
  fin: string;
  precio: number;
  premioGanado: boolean;
}

export default function CategoriaBooking({
  hotelSlug,
  categoria,
  usuario,
  onReservado,
}: {
  hotelSlug: string;
  categoria: CategoriaConDisponibilidad;
  usuario: UsuarioSesion | null | undefined;
  onReservado: () => void;
}) {
  const [turnoSeleccionado, setTurnoSeleccionado] = useState<TurnoHoras | null>(null);
  const [telefono, setTelefono] = useState("");
  const [usarPremio, setUsarPremio] = useState(false);
  const [modoAnonimo, setModoAnonimo] = useState(false);
  const [nombreAnonimo, setNombreAnonimo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmada, setConfirmada] = useState<ReservaConfirmada | null>(null);

  const voucherDisponible = usuario?.vouchers?.[0] ?? null;

  useEffect(() => {
    if (usuario?.telefono) setTelefono((prev) => prev || usuario.telefono || "");
  }, [usuario]);

  const sinCupo = categoria.disponibles === 0;

  async function reservar(e: React.FormEvent) {
    e.preventDefault();
    if (!turnoSeleccionado || !telefono.trim()) return;
    if (modoAnonimo && !nombreAnonimo.trim()) return;
    setEnviando(true);
    setError(null);
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hotelSlug,
          categoriaId: categoria.id,
          turnoHoras: turnoSeleccionado,
          clienteTelefono: telefono,
          voucherId: usarPremio ? voucherDisponible?.id : undefined,
          anonimo: modoAnonimo,
          clienteNombre: modoAnonimo ? nombreAnonimo : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo reservar");
        onReservado();
        return;
      }
      setConfirmada({
        codigo: data.reserva.codigo,
        inicio: data.reserva.inicio,
        fin: data.reserva.fin,
        precio: data.reserva.precio,
        premioGanado: data.premioGanado ?? false,
      });
      onReservado();
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  if (confirmada) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <p className="text-sm font-semibold text-emerald-700">¡Reserva confirmada!</p>
        <p className="mt-1 text-2xl font-bold tracking-wide text-emerald-800">
          {confirmada.codigo}
        </p>
        <p className="mt-2 text-sm text-emerald-700">
          {categoria.nombre} · {formatHora(confirmada.inicio)} a {formatHora(confirmada.fin)} ·{" "}
          {confirmada.precio === 0 ? "Gratis 🎁" : formatARS(confirmada.precio)}
        </p>
        <p className="mt-2 text-xs text-emerald-600">
          Mostrá este código al llegar a la recepción. Te guardamos la habitación hasta 15
          minutos después del horario de inicio.
        </p>
        {confirmada.premioGanado && (
          <p className="mt-3 rounded-lg bg-amber-50 p-2.5 text-xs font-semibold text-amber-700">
            🎉 ¡Con esta reserva sumaste 10 y ganaste una habitación gratis! Mirala en{" "}
            <a href="/perfil" className="underline">
              Mis reservas
            </a>
            .
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-sm">
      {categoria.foto && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={categoria.foto}
          alt={categoria.nombre}
          className="h-40 w-full object-cover"
        />
      )}
      <div className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-neutral-800">{categoria.nombre}</h3>
          <p className="mt-0.5 text-sm text-neutral-500">{categoria.descripcion}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
            sinCupo ? "bg-neutral-100 text-neutral-400" : "bg-emerald-50 text-emerald-600"
          }`}
        >
          {sinCupo
            ? "Sin disponibilidad"
            : `${categoria.disponibles} de ${categoria.totalHabitaciones} libres`}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {categoria.amenities.map((a) => (
          <span
            key={a}
            className="rounded-full bg-pink-50 px-2 py-0.5 text-[11px] font-medium text-pink-700"
          >
            {a}
          </span>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {categoria.turnos.map((t) => {
          const disabled = !t.activo || sinCupo;
          const selected = turnoSeleccionado === t.horas;
          return (
            <button
              key={t.horas}
              type="button"
              disabled={disabled}
              onClick={() => setTurnoSeleccionado(t.horas)}
              className={`rounded-xl border px-2 py-2.5 text-center transition ${
                disabled
                  ? "cursor-not-allowed border-neutral-100 bg-neutral-50 text-neutral-300"
                  : selected
                  ? "border-pink-500 bg-pink-500 text-white shadow-sm"
                  : "border-pink-200 bg-white text-neutral-700 hover:border-pink-400"
              }`}
            >
              <div className="text-sm font-semibold">{t.horas}h</div>
              <div className="text-xs">{disabled && !t.activo ? "No ofrecido" : formatARS(t.precio)}</div>
            </button>
          );
        })}
      </div>

      {turnoSeleccionado && !sinCupo && usuario === null && !modoAnonimo && (
        <div className="mt-4 space-y-2 border-t border-pink-50 pt-4">
          <p className="text-xs text-neutral-500">
            Para reservar necesitás iniciar sesión con tu cuenta de Google.
          </p>
          <GoogleLoginButton next={`/hotel/${hotelSlug}`} texto="Continuar con Google" />
          <button
            type="button"
            onClick={() => setModoAnonimo(true)}
            className="block text-xs text-neutral-400 underline hover:text-neutral-600"
          >
            Prefiero reservar de forma anónima
          </button>
        </div>
      )}

      {turnoSeleccionado && !sinCupo && usuario === null && modoAnonimo && (
        <form onSubmit={reservar} className="mt-4 space-y-2 border-t border-pink-50 pt-4">
          <p className="rounded-lg bg-neutral-50 p-2.5 text-xs text-neutral-600">
            Reserva anónima: no se vincula a ninguna cuenta de Google. Igual necesitamos tu
            nombre y teléfono para que el hotel pueda identificarte al llegar.
          </p>
          <p className="rounded-lg bg-amber-50 p-2.5 text-xs font-semibold text-amber-700">
            ⚠️ Reservando así no sumás para tu premio de fidelidad (una habitación gratis cada
            10 reservas).
          </p>
          <input
            required
            value={nombreAnonimo}
            onChange={(e) => setNombreAnonimo(e.target.value)}
            placeholder="Tu nombre"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none"
          />
          <input
            required
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="Tu teléfono"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none"
          />
          {error && <p className="text-xs font-medium text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={enviando}
              className="flex-1 rounded-lg bg-pink-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-pink-700 disabled:opacity-60"
            >
              {enviando ? "Confirmando…" : `Reservar de forma anónima · turno ${turnoSeleccionado}h`}
            </button>
            <button
              type="button"
              onClick={() => setModoAnonimo(false)}
              className="rounded-lg px-3 py-2.5 text-xs font-medium text-neutral-500 hover:bg-neutral-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {turnoSeleccionado && !sinCupo && usuario && (
        <form onSubmit={reservar} className="mt-4 space-y-2 border-t border-pink-50 pt-4">
          <p className="text-xs text-neutral-500">
            Reservando como <span className="font-semibold">{usuario.nombre}</span>
          </p>
          <input
            required
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="Tu teléfono"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none"
          />
          {voucherDisponible && (
            <label className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
              <input
                type="checkbox"
                checked={usarPremio}
                onChange={(e) => setUsarPremio(e.target.checked)}
                className="h-3.5 w-3.5 accent-amber-600"
              />
              🎁 Usar mi habitación gratis para esta reserva
            </label>
          )}
          {error && <p className="text-xs font-medium text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={enviando}
            className="w-full rounded-lg bg-pink-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-pink-700 disabled:opacity-60"
          >
            {enviando
              ? "Confirmando…"
              : `Reservar ahora · turno ${turnoSeleccionado}h`}
          </button>
        </form>
      )}
      </div>
    </div>
  );
}
