"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AMENIDADES_COMUNES, AmenidadOpcion } from "@/lib/amenidades";
import { IconCheck, IconChevron, IconClose } from "./icons";

export default function ServiciosDropdown({
  items,
  onChange,
  opciones = AMENIDADES_COMUNES,
  placeholderVacio = "Sin servicios seleccionados",
  permitirPersonalizado = true,
}: {
  items: string[];
  onChange: (items: string[]) => void;
  opciones?: AmenidadOpcion[];
  placeholderVacio?: string;
  permitirPersonalizado?: boolean;
}) {
  const [abierto, setAbierto] = useState(false);
  const [nuevo, setNuevo] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAbierto(false);
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setAbierto(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
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
  const extras = items.filter((i) => !opciones.some((a) => a.nombre === i));

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        aria-controls={panelId}
        className="field flex items-center justify-between text-left"
      >
        <span className={items.length === 0 ? "text-ink-3" : "font-semibold"}>
          {items.length === 0
            ? placeholderVacio
            : `${items.length} servicio${items.length === 1 ? "" : "s"} seleccionado${
                items.length === 1 ? "" : "s"
              }`}
        </span>
        <IconChevron
          size={18}
          className={`text-ink-3 transition-transform duration-300 ${abierto ? "rotate-180" : ""}`}
        />
      </button>

      {abierto && (
        <div
          id={panelId}
          className="panel absolute z-30 mt-2 w-full min-w-[280px] origin-top p-3.5 shadow-[0_24px_44px_-18px_rgba(63,19,41,0.55)]"
          style={{ animation: "rise-in 200ms var(--ease-out) both" }}
        >
          <div className="flex max-h-56 flex-wrap gap-2 overflow-y-auto p-0.5">
            {opciones.map(({ nombre }) => {
              const activo = items.includes(nombre);
              return (
                <button
                  key={nombre}
                  type="button"
                  onClick={() => toggle(nombre)}
                  aria-pressed={activo}
                  className="chip !min-h-10 !px-3.5"
                >
                  {activo && <IconCheck size={14} />}
                  {nombre}
                </button>
              );
            })}
            {extras.map((nombre) => (
              <button
                key={nombre}
                type="button"
                onClick={() => toggle(nombre)}
                aria-label={`Quitar ${nombre}`}
                className="chip !min-h-10 !px-3.5"
                data-on="true"
              >
                {nombre}
                <IconClose size={14} />
              </button>
            ))}
          </div>

          {permitirPersonalizado && (
            <div className="mt-3 flex gap-2 border-t border-line pt-3">
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
                aria-label="Otro servicio"
                className="field !min-h-10 flex-1 !py-1.5 text-sm"
              />
              <button
                type="button"
                onClick={agregarPersonalizado}
                className="btn btn-ghost !min-h-10 !px-4 !text-base"
              >
                Agregar
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setAbierto(false)}
            className="btn btn-primary mt-3 w-full !min-h-11"
          >
            Listo
          </button>
        </div>
      )}
    </div>
  );
}
