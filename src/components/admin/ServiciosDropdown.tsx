"use client";

import { useEffect, useRef, useState } from "react";
import { AMENIDADES_COMUNES } from "@/lib/amenidades";

export default function ServiciosDropdown({
  items,
  onChange,
}: {
  items: string[];
  onChange: (items: string[]) => void;
}) {
  const [abierto, setAbierto] = useState(false);
  const [nuevo, setNuevo] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAbierto(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function toggle(nombre: string) {
    onChange(items.includes(nombre) ? items.filter((i) => i !== nombre) : [...items, nombre]);
  }

  function agregarPersonalizado() {
    const v = nuevo.trim();
    if (!v || items.includes(v)) return;
    onChange([...items, v]);
    setNuevo("");
  }

  // Servicios ya elegidos que no están en la lista curada (cargados a mano).
  const extras = items.filter((i) => !AMENIDADES_COMUNES.some((a) => a.nombre === i));

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        className="flex w-full items-center justify-between rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-700 focus:border-pink-400 focus:outline-none"
      >
        <span>
          {items.length === 0
            ? "Sin servicios seleccionados"
            : `${items.length} servicio${items.length === 1 ? "" : "s"} seleccionado${
                items.length === 1 ? "" : "s"
              }`}
        </span>
        <span className={`text-neutral-400 transition-transform ${abierto ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>

      {abierto && (
        <div className="absolute z-20 mt-1.5 w-full rounded-xl border border-pink-100 bg-white p-3 shadow-lg">
          <div className="flex max-h-48 flex-wrap gap-1.5 overflow-y-auto">
            {AMENIDADES_COMUNES.map(({ nombre, icon }) => {
              const activo = items.includes(nombre);
              return (
                <button
                  key={nombre}
                  type="button"
                  onClick={() => toggle(nombre)}
                  aria-pressed={activo}
                  className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                    activo
                      ? "border-pink-500 bg-pink-50 text-pink-700"
                      : "border-neutral-200 text-neutral-600"
                  }`}
                >
                  <span aria-hidden="true">{icon}</span>
                  {nombre}
                </button>
              );
            })}
            {extras.map((nombre) => (
              <button
                key={nombre}
                type="button"
                onClick={() => toggle(nombre)}
                className="flex items-center gap-1 rounded-full border border-pink-500 bg-pink-50 px-2.5 py-1 text-xs font-medium text-pink-700"
              >
                {nombre} ×
              </button>
            ))}
          </div>

          <div className="mt-2 flex gap-2 border-t border-neutral-100 pt-2">
            <input
              value={nuevo}
              onChange={(e) => setNuevo(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  agregarPersonalizado();
                }
              }}
              placeholder="Otro servicio…"
              className="flex-1 rounded-lg border border-neutral-200 px-2.5 py-1.5 text-xs focus:border-pink-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={agregarPersonalizado}
              className="shrink-0 rounded-lg bg-pink-100 px-3 py-1.5 text-xs font-semibold text-pink-700 hover:bg-pink-200"
            >
              Agregar
            </button>
          </div>

          <button
            type="button"
            onClick={() => setAbierto(false)}
            className="mt-2 w-full rounded-lg bg-pink-600 py-1.5 text-xs font-semibold text-white hover:bg-pink-700"
          >
            Listo
          </button>
        </div>
      )}
    </div>
  );
}
