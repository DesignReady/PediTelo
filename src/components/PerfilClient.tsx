"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatARS, formatHora } from "@/lib/format";
import { Reserva } from "@/lib/types";
import GoogleLoginButton from "./GoogleLoginButton";

interface ReservaConHotel extends Reserva {
  hotelNombre: string;
  hotelSlug: string;
  categoriaNombre: string;
  gratisConPremio: boolean;
}

interface VoucherInfo {
  id: string;
  codigo: string;
  usado: boolean;
  usadoEn: string | null;
  creada: string;
}

interface PerfilData {
  usuario: { usuarioId: string; email: string; nombre: string };
  reservas: ReservaConHotel[];
  vouchers: VoucherInfo[];
  progreso: { totalReservas: number; faltanParaPremio: number; reservasPorPremio: number };
}

function formatFecha(iso: string): string {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "America/Argentina/Buenos_Aires",
  });
}

const ESTADO_LABEL: Record<string, string> = {
  activa: "Activa",
  finalizada: "Finalizada",
  cancelada: "Cancelada",
};

const ESTADO_CLASE: Record<string, string> = {
  activa: "bg-emerald-50 text-emerald-700",
  finalizada: "bg-neutral-100 text-neutral-500",
  cancelada: "bg-red-50 text-red-600",
};

export default function PerfilClient() {
  const [datos, setDatos] = useState<PerfilData | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/perfil")
      .then(async (res) => {
        if (res.status === 401) {
          setDatos(null);
          return;
        }
        if (!res.ok) throw new Error("Error del servidor");
        setDatos(await res.json());
      })
      .catch(() => setError("No pudimos cargar tu perfil. Revisá tu conexión e intentá de nuevo."));
  }, []);

  if (error) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (datos === undefined) {
    return <div className="px-4 py-16 text-center text-neutral-400">Cargando…</div>;
  }

  if (datos === null) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16 text-center">
        <p className="text-neutral-600">Iniciá sesión para ver tus reservas y premios.</p>
        <div className="mt-4">
          <GoogleLoginButton next="/perfil" />
        </div>
      </div>
    );
  }

  const { usuario, reservas, vouchers, progreso } = datos;
  const vouchersDisponibles = vouchers.filter((v) => !v.usado);
  const progresoActual =
    progreso.totalReservas === 0
      ? 0
      : progreso.reservasPorPremio - progreso.faltanParaPremio;
  const porcentaje = Math.round((progresoActual / progreso.reservasPorPremio) * 100);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
      <Link href="/" className="text-sm text-pink-600 sm:hover:underline">
        ← Volver a la búsqueda
      </Link>

      <h1 className="mt-3 text-xl font-extrabold text-neutral-800 sm:text-2xl">{usuario.nombre}</h1>
      <p className="text-sm text-neutral-500">{usuario.email}</p>

      <div className="mt-5 rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-neutral-800">
            🎁 Programa de fidelidad
          </h2>
          <span className="text-xs font-semibold text-neutral-400">
            {progresoActual}/{progreso.reservasPorPremio} reservas
          </span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-pink-50">
          <div
            className="h-full rounded-full bg-gradient-to-r from-pink-500 to-rose-600 transition-all"
            style={{ width: `${porcentaje}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-neutral-500">
          {progreso.faltanParaPremio === progreso.reservasPorPremio
            ? `Te faltan ${progreso.reservasPorPremio} reservas para tu próxima habitación gratis.`
            : `Te faltan ${progreso.faltanParaPremio} reserva${
                progreso.faltanParaPremio === 1 ? "" : "s"
              } más para tu próxima habitación gratis.`}
        </p>
      </div>

      {vouchersDisponibles.length > 0 && (
        <div className="mt-5 space-y-3">
          {vouchersDisponibles.map((v) => (
            <div
              key={v.id}
              className="relative overflow-hidden rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50 p-5"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
                Boucher de habitación gratis
              </p>
              <p className="mt-1 text-lg font-extrabold tracking-wide text-amber-800">
                {v.codigo}
              </p>
              <p className="mt-1 text-sm text-amber-700">
                A nombre de <span className="font-semibold">{usuario.nombre}</span> ·{" "}
                {usuario.email}
              </p>
              <p className="mt-2 text-xs text-amber-600">
                Canjealo eligiendo cualquier hotel y activando la opción "Usar mi habitación
                gratis" al reservar.
              </p>
            </div>
          ))}
        </div>
      )}

      <h2 className="mt-8 mb-3 text-base font-bold text-neutral-800 sm:text-lg">Mis reservas</h2>
      {reservas.length === 0 ? (
        <p className="text-sm text-neutral-400">Todavía no hiciste ninguna reserva.</p>
      ) : (
        <div className="space-y-3">
          {reservas.map((r) => (
            <div key={r.id} className="rounded-xl border border-pink-100 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <Link
                    href={`/hotel/${r.hotelSlug}`}
                    className="text-sm font-semibold text-neutral-800 hover:text-pink-700"
                  >
                    {r.hotelNombre}
                  </Link>
                  <p className="text-xs text-neutral-400">{r.categoriaNombre}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${ESTADO_CLASE[r.estado]}`}
                >
                  {ESTADO_LABEL[r.estado]}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-500">
                <span>
                  {formatFecha(r.creada)} · Turno {r.turnoHoras}h · {formatHora(r.inicio)}–
                  {formatHora(r.fin)}
                </span>
                <span className="font-semibold text-neutral-700">
                  {r.gratisConPremio ? "Gratis 🎁" : formatARS(r.precio)}
                </span>
              </div>
              <p className="mt-1 text-xs font-semibold tracking-wide text-pink-600">{r.codigo}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
