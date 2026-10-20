"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatARS, formatHora } from "@/lib/format";
import { Reserva } from "@/lib/types";
import GoogleLoginButton from "./GoogleLoginButton";
import Digits from "./Digits";
import { IconBack, IconGift, IconWifiOff } from "./icons";

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
  activa: "bg-tint text-pink-text",
  finalizada: "bg-surface-2 text-ink-3",
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
      <div role="alert" className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-20 text-center">
        <IconWifiOff size={32} className="text-pink-text" />
        <p className="font-semibold">{error}</p>
        <button onClick={() => location.reload()} className="btn btn-primary">
          Reintentar
        </button>
      </div>
    );
  }

  if (datos === undefined) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 px-3 pt-5 sm:px-6" aria-hidden="true">
        <div className="sign sign--ghost h-44 [--r:2rem]" />
        <div className="sign sign--ghost h-32" />
      </div>
    );
  }

  if (datos === null) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16 text-center">
        <div className="sign mx-auto mb-6 w-fit px-6 py-3 [--r:1.1rem]" data-glint="1">
          <span className="relative font-display text-3xl font-extrabold">Mi cuenta</span>
        </div>
        <p className="text-ink-2">Iniciá sesión para ver tus reservas, tu progreso y tus premios.</p>
        <div className="mt-5">
          <GoogleLoginButton next="/perfil" />
        </div>
      </div>
    );
  }

  const { usuario, reservas, vouchers, progreso } = datos;
  const vouchersDisponibles = vouchers.filter((v) => !v.usado);
  const progresoActual =
    progreso.totalReservas === 0 ? 0 : progreso.reservasPorPremio - progreso.faltanParaPremio;

  return (
    <div className="mx-auto max-w-2xl px-3 pb-10 pt-3 sm:px-6 sm:pt-5">
      <Link href="/" className="btn btn-quiet -ml-2 gap-1.5">
        <IconBack size={18} />
        Volver a la búsqueda
      </Link>

      <header className="mt-1 px-1">
        <h1 className="font-display text-[clamp(2.4rem,10vw,3.6rem)] font-extrabold leading-[0.92]">
          {usuario.nombre}
        </h1>
        <p className="mt-1 text-ink-3">{usuario.email}</p>
      </header>

      {/* ───── Ruta de fidelidad: cada reserva es un hito ───── */}
      <section className="sign mt-5 px-6 pb-6 pt-6 [--r:1.75rem]" data-glint="1" aria-labelledby="titulo-ruta">
        <div className="relative z-[3]">
          <div className="flex items-end justify-between gap-3">
            <h2 id="titulo-ruta" className="font-display text-[1.7rem] font-extrabold leading-none">
              Tu ruta al premio
            </h2>
            <span className="flex items-baseline gap-1 text-ink-2">
              <Digits value={progresoActual} className="text-[2.6rem]" label={`${progresoActual} reservas`} />
              <span className="font-display text-2xl font-bold">/ {progreso.reservasPorPremio}</span>
            </span>
          </div>

          <ol className="mt-4 grid grid-cols-10 gap-1" aria-hidden="true">
            {Array.from({ length: progreso.reservasPorPremio }, (_, i) => (
              <li
                key={i}
                className={`h-8 rounded-md transition-colors duration-500 ${
                  i < progresoActual ? "bg-sheet" : "border-2 border-line-strong"
                }`}
                style={{ transitionDelay: `${i * 60}ms` }}
              />
            ))}
          </ol>

          <p className="mt-3 text-[0.95rem] font-semibold text-ink-2">
            {progreso.faltanParaPremio === progreso.reservasPorPremio
              ? `Te faltan ${progreso.reservasPorPremio} reservas para tu próxima habitación gratis.`
              : `Te ${progreso.faltanParaPremio === 1 ? "falta" : "faltan"} ${progreso.faltanParaPremio} reserva${
                  progreso.faltanParaPremio === 1 ? "" : "s"
                } para tu próxima habitación gratis.`}
          </p>
        </div>
      </section>

      {vouchersDisponibles.length > 0 && (
        <div className="mt-5 space-y-4">
          {vouchersDisponibles.map((v, i) => (
            <div key={v.id} className="ticket rise-in" style={{ ["--d" as string]: `${i * 90}ms`, ["--notch" as string]: "58%" }}>
              <div className="flex items-center gap-3 px-6 pb-4 pt-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-tint text-pink-text">
                  <IconGift size={22} />
                </span>
                <div>
                  <p className="font-display text-2xl font-extrabold leading-none">
                    Habitación gratis
                  </p>
                  <p className="mt-0.5 text-sm text-ink-3">Boucher a nombre de {usuario.nombre}</p>
                </div>
              </div>
              <div className="perforation mx-5" />
              <div className="px-6 pb-5 pt-3">
                <p className="text-sm font-bold text-ink-3">Código</p>
                <Digits value={v.codigo} slots className="text-[2.3rem] text-pink-text" label={`Código ${v.codigo}`} />
                <p className="mt-2 text-sm text-ink-2">
                  Canjealo en cualquier hotel: al reservar, activá “Usar mi habitación gratis”.
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="mb-3 mt-9 font-display text-[2rem] font-extrabold leading-none">
        Mis reservas
      </h2>
      {reservas.length === 0 ? (
        <p className="panel px-4 py-6 text-ink-2">Todavía no hiciste ninguna reserva.</p>
      ) : (
        <div className="space-y-3">
          {reservas.map((r, i) => (
            <article key={r.id} className="panel rise-in p-4" style={{ ["--d" as string]: `${Math.min(i, 8) * 50}ms` }}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <Link
                    href={`/hotel/${r.hotelSlug}`}
                    className="font-display text-[1.45rem] font-extrabold leading-none hover:text-pink-text"
                  >
                    {r.hotelNombre}
                  </Link>
                  <p className="mt-0.5 text-sm text-ink-3">{r.categoriaNombre}</p>
                </div>
                <span className={`rounded-md px-2 py-1 font-display text-sm font-extrabold tracking-wide ${ESTADO_CLASE[r.estado]}`}>
                  {ESTADO_LABEL[r.estado]}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t-2 border-dashed border-line pt-3 text-sm">
                <span className="tabular-nums text-ink-2">
                  {formatFecha(r.creada)} · {r.turnoHoras}h · {formatHora(r.inicio)}–{formatHora(r.fin)}
                </span>
                <span className="font-display text-xl font-bold tabular-nums">
                  {r.gratisConPremio ? "Gratis" : formatARS(r.precio)}
                </span>
              </div>
              <p className="mt-1 font-display text-lg font-bold tracking-[0.08em] text-pink-text">{r.codigo}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
