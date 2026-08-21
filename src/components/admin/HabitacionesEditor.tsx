"use client";

import { Habitacion } from "@/lib/types";
import ToggleSwitch from "./ToggleSwitch";

let contadorTemporal = 0;

export default function HabitacionesEditor({
  habitaciones,
  onChange,
}: {
  habitaciones: Habitacion[];
  onChange: (habitaciones: Habitacion[]) => void;
}) {
  function actualizar(id: string, cambios: Partial<Habitacion>) {
    onChange(habitaciones.map((h) => (h.id === id ? { ...h, ...cambios } : h)));
  }

  function quitar(id: string) {
    onChange(habitaciones.filter((h) => h.id !== id));
  }

  function agregar() {
    const numeros = habitaciones
      .map((h) => Number(h.numero))
      .filter((n) => Number.isFinite(n));
    const siguiente = numeros.length ? Math.max(...numeros) + 1 : habitaciones.length + 1;
    contadorTemporal += 1;
    onChange([
      ...habitaciones,
      { id: `temp_${Date.now()}_${contadorTemporal}`, numero: String(siguiente), disponible: true },
    ]);
  }

  return (
    <div>
      {habitaciones.length === 0 && (
        <p className="text-xs text-neutral-300">Todavía no cargaste ninguna habitación.</p>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {habitaciones.map((h) => (
          <div
            key={h.id}
            className="relative flex flex-col items-center gap-1.5 rounded-xl border border-neutral-200 py-3"
          >
            <button
              type="button"
              onClick={() => quitar(h.id)}
              aria-label={`Quitar habitación ${h.numero}`}
              className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-neutral-200 bg-white text-[11px] leading-none text-neutral-400 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              ×
            </button>

            <input
              value={h.numero}
              onChange={(e) => actualizar(h.id, { numero: e.target.value })}
              aria-label="Número de habitación"
              className="w-16 rounded-lg border-none bg-transparent text-center text-lg font-bold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-pink-300"
            />
            <ToggleSwitch
              checked={h.disponible}
              onChange={(v) => actualizar(h.id, { disponible: v })}
              label={`Habitación ${h.numero} disponible`}
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={agregar}
        className="mt-3 w-full rounded-lg border border-dashed border-pink-200 py-2 text-xs font-semibold text-pink-600 hover:bg-pink-50"
      >
        + Agregar habitación
      </button>
    </div>
  );
}
