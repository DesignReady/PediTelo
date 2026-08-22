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
      <div className="rounded-2xl border border-dashed border-pink-200 bg-pink-50/50 p-6 text-center text-sm text-neutral-500">
        No hay reservas activas en este momento.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-pink-100 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-pink-50 text-xs uppercase tracking-wide text-pink-700">
          <tr>
            <th className="px-4 py-3">Código</th>
            <th className="px-4 py-3">Cliente</th>
            <th className="px-4 py-3">Categoría</th>
            <th className="px-4 py-3">Turno</th>
            <th className="px-4 py-3">Horario</th>
            <th className="px-4 py-3">Precio</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-pink-50">
          {reservas.map((r) => (
            <tr key={r.id}>
              <td className="px-4 py-3 font-semibold text-neutral-700">{r.codigo}</td>
              <td className="px-4 py-3 text-neutral-600">
                {r.clienteNombre}
                <div className="text-xs text-neutral-400">{r.clienteTelefono}</div>
              </td>
              <td className="px-4 py-3 text-neutral-600">{categoriaNombre(r.categoriaId)}</td>
              <td className="px-4 py-3 text-neutral-600">{r.turnoHoras}h</td>
              <td className="px-4 py-3 text-neutral-600">
                {formatHora(r.inicio)} – {formatHora(r.fin)}
              </td>
              <td className="px-4 py-3 text-neutral-600">{formatARS(r.precio)}</td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => finalizar(r.id)}
                  disabled={procesando === r.id}
                  className="rounded-lg border border-pink-200 px-3 py-1.5 text-xs font-semibold text-pink-700 transition hover:bg-pink-50 disabled:opacity-60"
                >
                  {procesando === r.id ? "…" : "Finalizar ahora"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
