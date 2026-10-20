"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CategoriaConDisponibilidad, TurnoHoras, UsuarioSesion } from "@/lib/types";
import { formatARS, formatHora } from "@/lib/format";
import GoogleLoginButton from "./GoogleLoginButton";
import Digits from "./Digits";
import { IconAlert, IconArrow, IconCheck, IconGift, IconMask } from "./icons";

interface ReservaConfirmada {
  codigo: string;
  hotelNombre: string;
  inicio: string;
  fin: string;
  precio: number;
  turnoHoras: number;
  premioGanado: boolean;
  anonima: boolean;
}

/** Una pastilla por habitación: encendida si está libre, apagada si está ocupada. */
function Pips({ total, libres }: { total: number; libres: number }) {
  return (
    <div className="flex flex-wrap gap-1" aria-hidden="true">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`h-4 w-2.5 rounded-[4px] transition-colors duration-300 ${
            i < libres ? "bg-sheet" : "border-[1.5px] border-line-strong"
          }`}
        />
      ))}
    </div>
  );
}

export default function CategoriaBooking({
  hotelSlug,
  categoria,
  usuario,
  hotelAbierto = true,
  onReservado,
}: {
  hotelSlug: string;
  categoria: CategoriaConDisponibilidad;
  usuario: UsuarioSesion | null | undefined;
  hotelAbierto?: boolean;
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
  const turnoElegido = categoria.turnos.find((t) => t.horas === turnoSeleccionado) ?? null;

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
        hotelNombre: data.hotelNombre ?? "",
        inicio: data.reserva.inicio,
        fin: data.reserva.fin,
        precio: data.reserva.precio,
        turnoHoras: data.reserva.turnoHoras ?? turnoSeleccionado,
        premioGanado: data.premioGanado ?? false,
        anonima: modoAnonimo,
      });
      onReservado();
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  /* ───── Confirmación: el ticket sale de la ranura ───── */
  if (confirmada) {
    return (
      <div className="mx-auto w-full max-w-md" role="status" style={{ animation: "ticket-out 520ms var(--ease-out) both" }}>
        <div className="ticket" style={{ ["--notch" as string]: "63%" }}>
          <div className="sign !rounded-b-none !rounded-t-[1.25rem] !border-0 px-6 pb-6 pt-6" data-glint="1">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sheet text-white">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path
                    d="m5 12.5 4.5 4.5L19 7"
                    style={{ strokeDasharray: 26, strokeDashoffset: 26, animation: "draw 520ms 380ms var(--ease-out) forwards" }}
                  />
                </svg>
              </span>
              <p className="font-display text-[1.6rem] font-extrabold leading-none">
                Reserva confirmada
              </p>
            </div>
            <p className="mt-5 text-sm font-semibold text-ink-2">
              Tu código
            </p>
            <Digits
              value={confirmada.codigo}
              slots
              ignite
              className="text-[3.2rem] sm:text-[3.8rem]"
              label={`Código de reserva ${confirmada.codigo}`}
            />
          </div>

          <div className="perforation mx-5" />

          <div className="px-6 pb-6 pt-4">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div>
                <dt className="font-bold text-ink-3">Hotel</dt>
                <dd className="font-display text-xl font-bold leading-tight">{confirmada.hotelNombre || "—"}</dd>
              </div>
              <div>
                <dt className="font-bold text-ink-3">Habitación</dt>
                <dd className="font-display text-xl font-bold leading-tight">{categoria.nombre}</dd>
              </div>
              <div>
                <dt className="font-bold text-ink-3">Horario</dt>
                <dd className="font-display text-xl font-bold leading-tight tabular-nums">
                  {formatHora(confirmada.inicio)} a {formatHora(confirmada.fin)}
                </dd>
              </div>
              <div>
                <dt className="font-bold text-ink-3">Turno · Total</dt>
                <dd className="font-display text-xl font-bold leading-tight tabular-nums">
                  {confirmada.turnoHoras}h · {confirmada.precio === 0 ? "Gratis" : formatARS(confirmada.precio)}
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-sm text-ink-2">
              Mostrá este código al llegar a la recepción. Te guardamos la habitación hasta 15
              minutos después del horario de inicio.
            </p>
            {confirmada.anonima && (
              <p className="mt-3 flex gap-2 rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-700">
                <IconAlert size={18} className="mt-0.5 shrink-0" />
                Como reservaste sin cuenta, el código no queda guardado: sacale una captura.
              </p>
            )}
            {confirmada.premioGanado && (
              <Link
                href="/perfil"
                className="mt-3 flex items-center gap-2 rounded-xl bg-tint p-3 text-sm font-bold text-pink-text"
              >
                <IconGift size={20} className="shrink-0" />
                <span className="flex-1">Sumaste 10 reservas: ganaste una habitación gratis.</span>
                <IconArrow size={18} />
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <article className="panel overflow-hidden">
      {categoria.foto && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={categoria.foto}
          alt={`Habitación ${categoria.nombre}`}
          className="aspect-[16/9] w-full object-cover"
          loading="lazy"
        />
      )}

      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display text-[2rem] font-extrabold leading-none">
              {categoria.nombre}
            </h3>
            {categoria.descripcion && (
              <p className="mt-1.5 text-[0.95rem] text-ink-2">{categoria.descripcion}</p>
            )}
          </div>
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-sm font-bold ${
              sinCupo ? "bg-alert text-white" : "bg-tint text-pink-text"
            }`}
          >
            {!hotelAbierto ? "Cerrado" : sinCupo ? "Lleno" : `${categoria.disponibles} libres`}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <Pips total={categoria.totalHabitaciones} libres={categoria.disponibles} />
          <span className="text-sm font-semibold text-ink-3">
            {categoria.disponibles} de {categoria.totalHabitaciones}
          </span>
        </div>

        {categoria.amenities.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {categoria.amenities.map((a) => (
              <span key={a} className="chip !min-h-7 !px-2.5 !text-xs">
                {a}
              </span>
            ))}
          </div>
        )}

        <div className="mt-5 grid grid-cols-3 gap-2.5" role="group" aria-label={`Turnos de ${categoria.nombre}`}>
          {categoria.turnos.map((t) => {
            const deshabilitado = !t.activo || sinCupo || !hotelAbierto;
            const elegido = turnoSeleccionado === t.horas;
            return (
              <button
                key={t.horas}
                type="button"
                disabled={deshabilitado}
                aria-pressed={elegido}
                onClick={() => setTurnoSeleccionado(t.horas)}
                className={`relative flex min-h-[5.75rem] flex-col items-center justify-center gap-0.5 rounded-2xl px-1.5 py-2 text-center transition-[transform,background-color,color,box-shadow] duration-200 [transition-timing-function:var(--ease-out)] active:scale-[0.96] ${
                  deshabilitado
                    ? "cursor-not-allowed border-2 border-dashed border-line-strong text-ink-3"
                    : elegido
                    ? "border-2 border-sheet bg-tint text-pink-text -translate-y-0.5 shadow-[0_10px_20px_-12px_rgba(190,24,93,0.8)]"
                    : "border-2 border-line bg-surface-2 text-ink hover:border-sheet"
                }`}
              >
                <span className="relative flex items-baseline gap-1 font-display font-extrabold leading-none">
                  <span className="text-[2.1rem]">{t.horas}</span>
                  <span className="text-base">{t.horas === 1 ? "hora" : "horas"}</span>
                </span>
                <span className="relative font-display text-[1.15rem] font-bold leading-none tabular-nums">
                  {!t.activo ? "No ofrecido" : formatARS(t.precio)}
                </span>
              </button>
            );
          })}
        </div>

        {/* ───── Reserva ───── */}
        <div className="fold" data-open={!!turnoSeleccionado && !sinCupo && hotelAbierto}>
          <div className="fold-inner" inert={!turnoSeleccionado || sinCupo || !hotelAbierto}>
            {turnoSeleccionado && !sinCupo && hotelAbierto && usuario === null && !modoAnonimo && (
              <div className="mt-5 space-y-3 border-t-2 border-dashed border-line pt-5">
                <p className="text-[0.95rem] text-ink-2">
                  Para reservar iniciá sesión con tu cuenta de Google: así guardamos tu historial
                  y vas sumando para tu habitación gratis.
                </p>
                <GoogleLoginButton next={`/hotel/${hotelSlug}`} texto="Continuar con Google" />
                <button
                  type="button"
                  onClick={() => setModoAnonimo(true)}
                  className="btn btn-quiet w-full"
                >
                  <IconMask size={18} />
                  Prefiero reservar de forma anónima
                </button>
              </div>
            )}

            {turnoSeleccionado && !sinCupo && usuario === null && modoAnonimo && (
              <form onSubmit={reservar} className="mt-5 space-y-3 border-t-2 border-dashed border-line pt-5">
                <p className="flex gap-2 rounded-xl bg-surface-2 p-3 text-sm text-ink-2">
                  <IconMask size={18} className="mt-0.5 shrink-0" />
                  Reserva anónima: no se vincula a tu cuenta de Google. Igual necesitamos tu nombre
                  y teléfono para que el hotel te identifique al llegar.
                </p>
                <p className="flex gap-2 rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-700">
                  <IconAlert size={18} className="mt-0.5 shrink-0" />
                  Reservando así no sumás para tu premio de fidelidad (una habitación gratis cada
                  10 reservas).
                </p>
                <div>
                  <label htmlFor={`nombre-${categoria.id}`} className="mb-1 block text-sm font-bold text-ink-2">
                    Tu nombre
                  </label>
                  <input
                    id={`nombre-${categoria.id}`}
                    required
                    value={nombreAnonimo}
                    onChange={(e) => setNombreAnonimo(e.target.value)}
                    autoComplete="name"
                    className="field"
                  />
                </div>
                <div>
                  <label htmlFor={`tel-${categoria.id}`} className="mb-1 block text-sm font-bold text-ink-2">
                    Tu teléfono
                  </label>
                  <input
                    id={`tel-${categoria.id}`}
                    required
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="field"
                  />
                </div>
                {error && (
                  <p role="alert" className="flex gap-2 text-sm font-semibold text-red-600">
                    <IconAlert size={18} className="mt-0.5 shrink-0" />
                    {error}
                  </p>
                )}
                <button type="submit" disabled={enviando} className="btn btn-primary w-full !min-h-14 !text-xl">
                  {enviando ? "Confirmando…" : `Reservar anónimo · ${turnoSeleccionado}h`}
                  {!enviando && <IconArrow size={22} />}
                </button>
                <button type="button" onClick={() => setModoAnonimo(false)} className="btn btn-quiet w-full">
                  Mejor entro con Google
                </button>
              </form>
            )}

            {turnoSeleccionado && !sinCupo && usuario && (
              <form onSubmit={reservar} className="mt-5 space-y-3 border-t-2 border-dashed border-line pt-5">
                <p className="text-[0.95rem] text-ink-2">
                  Reservando como <span className="font-bold text-ink">{usuario.nombre}</span>
                </p>
                <div>
                  <label htmlFor={`tel-${categoria.id}`} className="mb-1 block text-sm font-bold text-ink-2">
                    Tu teléfono
                  </label>
                  <input
                    id={`tel-${categoria.id}`}
                    required
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="field"
                  />
                </div>
                {voucherDisponible && (
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-sheet bg-tint p-3 text-sm font-bold text-pink-text">
                    <input
                      type="checkbox"
                      checked={usarPremio}
                      onChange={(e) => setUsarPremio(e.target.checked)}
                      className="h-5 w-5"
                    />
                    <IconGift size={20} className="shrink-0" />
                    Usar mi habitación gratis en esta reserva
                  </label>
                )}
                {error && (
                  <p role="alert" className="flex gap-2 text-sm font-semibold text-red-600">
                    <IconAlert size={18} className="mt-0.5 shrink-0" />
                    {error}
                  </p>
                )}
                <button type="submit" disabled={enviando} className="btn btn-primary w-full !min-h-14 !text-xl">
                  {enviando
                    ? "Confirmando…"
                    : `Reservar · ${turnoSeleccionado}h · ${
                        usarPremio && voucherDisponible
                          ? "Gratis"
                          : turnoElegido
                          ? formatARS(turnoElegido.precio)
                          : ""
                      }`}
                  {!enviando && <IconCheck size={22} />}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
