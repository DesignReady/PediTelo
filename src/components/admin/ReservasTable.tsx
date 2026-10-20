"use client";

import { useState } from "react";
import { Reserva } from "@/lib/types";
import { formatARS, formatHora } from "@/lib/format";

export default function ReservasTable({
  reservas,
  categoriaNombre,
  onCambio,
}: {
  reservas: Reserva[];
  categoriaNombre: (categoriaId: string | null) => string;
  onCambio: () => void;
}) {
  const [procesando, setProcesando] = useState<string | null>(null);

  async function finalizar(id: string) {
    setProcesando(id);
    try {
      await fetch(`/api/admin/reservas/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "finalizada" }),
      });
      onCambio();
    } finally {
      setProcesando(null);
    }
  }

  if (reservas.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-line-strong px-5 py-8 text-center text-ink-2">
        No hay reservas activas en este momento.
      </div>
    );
  }

  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {reservas.map((r, i) => (
        <li
          key={r.id}
          className="panel rise-in flex flex-col gap-3 p-4"
          style={{ ["--d" as string]: `${Math.min(i, 6) * 45}ms` }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-ink-3">Código</p>
              <p className="font-display text-[1.9rem] font-extrabold leading-none tracking-[0.04em] text-pink-text">
                {r.codigo}
              </p>
            </div>
            <p className="font-display text-2xl font-bold tabular-nums">
              {r.precio === 0 ? "Gratis" : formatARS(r.precio)}
            </p>
          </div>

          <div>
            <p className="font-semibold">{r.clienteNombre}</p>
            <p className="text-sm tabular-nums text-ink-3">{r.clienteTelefono}</p>
          </div>

          <p className="text-sm text-ink-2">
            {categoriaNombre(r.categoriaId)} · turno {r.turnoHoras}h ·{" "}
            <span className="tabular-nums">
              {formatHora(r.inicio)} – {formatHora(r.fin)}
            </span>
          </p>

          <button
            onClick={() => finalizar(r.id)}
            disabled={procesando === r.id}
            className="btn btn-ghost !min-h-11 self-start !text-base"
          >
            {procesando === r.id ? "Finalizando…" : "Finalizar ahora"}
          </button>
        </li>
      ))}
    </ul>
  );
}
