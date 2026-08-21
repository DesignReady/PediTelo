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
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {habitaciones.map((h) => (
          <div
            key={h.id}
            className="flex items-center justify-between gap-2 rounded-xl border border-neutral-200 px-3 py-2"
          >
            <label className="flex items-center gap-1.5">
              <span className="text-xs text-neutral-400">Hab.</span>
              <input
                value={h.numero}
                onChange={(e) => actualizar(h.id, { numero: e.target.value })}
                aria-label="Número de habitación"
                className="w-16 rounded-lg border border-neutral-200 px-2 py-1 text-sm font-semibold text-neutral-800 focus:border-pink-400 focus:outline-none"
              />
            </label>

            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-medium ${
                  h.disponible ? "text-emerald-600" : "text-neutral-400"
                }`}
              >
                {h.disponible ? "Libre" : "Ocupada"}
              </span>
              <ToggleSwitch
                checked={h.disponible}
                onChange={(v) => actualizar(h.id, { disponible: v })}
                label={`Habitación ${h.numero} disponible`}
              />
              <button
                type="button"
                onClick={() => quitar(h.id)}
                aria-label={`Quitar habitación ${h.numero}`}
                className="text-neutral-300 hover:text-red-500"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={agregar}
        className="mt-2 w-full rounded-lg border border-dashed border-pink-200 py-2 text-xs font-semibold text-pink-600 hover:bg-pink-50"
      >
        + Agregar habitación
      </button>
    </div>
  );
}
