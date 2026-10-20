"use client";

import { Habitacion } from "@/lib/types";
import ToggleSwitch from "./ToggleSwitch";
import { IconClose, IconPlus } from "../icons";

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
        <p className="text-sm text-ink-3">Todavía no cargaste ninguna habitación.</p>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {habitaciones.map((h) => (
          <div
            key={h.id}
            className={`relative flex flex-col items-center gap-0.5 rounded-2xl border-2 pb-1.5 pt-3 transition-colors duration-300 ${
              h.disponible ? "border-sheet bg-tint" : "border-line-strong bg-surface-2"
            }`}
          >
            <button
              type="button"
              onClick={() => quitar(h.id)}
              aria-label={`Quitar habitación ${h.numero}`}
              className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-line-strong bg-surface text-ink-3 transition hover:border-alert hover:text-alert"
            >
              <IconClose size={13} />
            </button>

            <label className="sr-only" htmlFor={`hab-${h.id}`}>
              Número de habitación
            </label>
            <input
              id={`hab-${h.id}`}
              value={h.numero}
              onChange={(e) => actualizar(h.id, { numero: e.target.value })}
              className="w-20 rounded-lg border-none bg-transparent text-center font-display text-[2rem] font-extrabold leading-none text-ink focus:outline-none focus:ring-2 focus:ring-sheet"
            />
            <p className="text-xs font-bold uppercase tracking-wide text-ink-3">
              {h.disponible ? "Libre" : "Ocupada"}
            </p>
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
        className="mt-3 flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-line-strong text-sm font-bold text-pink-text transition hover:border-sheet hover:bg-tint"
      >
        <IconPlus size={16} />
        Agregar habitación
      </button>
    </div>
  );
}
